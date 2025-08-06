import requests
from bs4 import BeautifulSoup
import pandas as pd
import time
import os
import argparse
from concurrent.futures import ThreadPoolExecutor, as_completed
from threading import Lock
import threading
import urllib3
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

# 禁用SSL警告
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

BASE_URL = "https://www.gai-rou.com"
LIST_PAGE_URL = BASE_URL + "/kanri_list/"

# 创建更稳定的session
session = requests.Session()
retry_strategy = Retry(
    total=3,
    backoff_factor=1,
    status_forcelist=[429, 500, 502, 503, 504],
)
adapter = HTTPAdapter(max_retries=retry_strategy)
session.mount("http://", adapter)
session.mount("https://", adapter)

headers = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
    "Accept-Language": "ja,en-US;q=0.7,en;q=0.3",
    "Accept-Encoding": "gzip, deflate, br",
    "Connection": "keep-alive",
    "Upgrade-Insecure-Requests": "1",
}

# 线程安全的锁和共享数据
data_lock = Lock()
all_companies = []
processed_count = 0
total_count = 0

def get_company_links(page=1):
    """获取列表页上的所有公司内页链接"""
    url = LIST_PAGE_URL + f"page/{page}/"
    
    for attempt in range(3):  # 重试3次
        try:
            print(f"📄 正在抓取第 {page} 页... (尝试 {attempt + 1}/3)")
            
            # 使用session而不是requests.get
            res = session.get(url, headers=headers, timeout=30, verify=False)
            
            # 检查请求是否成功
            if res.status_code != 200:
                print(f"❌ 页面 {page} 加载失败，状态码: {res.status_code}")
                if attempt < 2:
                    time.sleep(5)  # 等待5秒后重试
                    continue
                return []

            soup = BeautifulSoup(res.text, "html.parser")
            
            links = []
            # 首先找到所有 box_dantai_list 容器
            box_containers = soup.find_all("div", class_="box_dantai_list")
            
            # 在每个 box_dantai_list 容器中提取链接
            for i, box in enumerate(box_containers):
                all_links_in_box = box.find_all("a", href=True)
                
                for j, a_tag in enumerate(all_links_in_box):
                    href = a_tag["href"]
                    
                    # 检查链接是否包含 "/kanri/" 并且是有效的企业页面链接
                    if "/kanri/" in href:
                        # 处理相对路径
                        if href.startswith("/"):
                            full_url = BASE_URL + href
                        # 处理绝对路径
                        elif href.startswith("http"):
                            full_url = href
                        # 处理其他相对路径
                        else:
                            full_url = BASE_URL + "/" + href
                        
                        links.append(full_url)

            print(f"📄 第 {page} 页找到 {len(box_containers)} 个容器，抓取到 {len(links)} 个企业链接")
            return list(set(links))  # set 自动去重
            
        except Exception as e:
            print(f"❌ 抓取第 {page} 页失败 (尝试 {attempt + 1}/3): {e}")
            if attempt < 2:
                time.sleep(10)  # 等待10秒后重试
            else:
                return []
    
    return []

def get_company_info(company_url):
    """从公司内页中提取特定信息"""
    for attempt in range(3):  # 重试3次
        try:
            # 使用session而不是requests.get
            res = session.get(company_url, headers=headers, timeout=30, verify=False)
            soup = BeautifulSoup(res.text, "html.parser")
            
            data = {'URL': company_url}
            
            # 查找所有 dl_dantai_list 元素
            dl_elements = soup.find_all("dl", class_="dl_dantai_list")
            
            print(f"🔍 找到 {len(dl_elements)} 个 dl_dantai_list 元素")
            
            # 找到当前企业的主要信息区域
            current_company_data = {}
            
            for i, dl in enumerate(dl_elements):
                dt = dl.find("dt")
                dd = dl.find("dd")
                
                if dt and dd:
                    label = dt.text.strip()
                    
                    # 对于地址字段，需要特殊处理以排除Google Maps链接
                    if "住所" in label:
                        # 检查是否包含Google Maps链接
                        google_maps_link = dd.find("a", href=lambda x: x and "maps.google.com" in x)
                        if google_maps_link:
                            # 获取链接前的文本内容（地址）
                            text_parts = []
                            for content in dd.contents:
                                if isinstance(content, str):
                                    text_parts.append(content.strip())
                            value = ' '.join(text_parts).strip()
                            print(f"📍 第{i+1}个元素 - 地址(带Google Maps): {value}")
                        else:
                            # 如果没有Google Maps链接，使用原来的方法
                            text_parts = []
                            for content in dd.contents:
                                if isinstance(content, str):
                                    text_parts.append(content.strip())
                            value = ' '.join(text_parts).strip()
                            print(f"📍 第{i+1}个元素 - 地址(无Google Maps): {value}")
                    else:
                        value = dd.text.strip()
                    
                    # 只保存第一个找到的每个字段（通常是当前企业的信息）
                    if "団体名" in label and "団体名" not in current_company_data:
                        current_company_data['団体名'] = value
                        print(f"🏢 第{i+1}个元素 - 団体名: {value}")
                    elif "住所" in label and "住所" not in current_company_data:
                        # 只保存带有Google Maps链接的地址
                        google_maps_link = dd.find("a", href=lambda x: x and "maps.google.com" in x)
                        if google_maps_link:
                            current_company_data['住所'] = value
                            print(f"✅ 保存带Google Maps的地址: {value}")
                        else:
                            print(f"⚠️ 跳过无Google Maps的地址: {value}")
                    elif "FAX番号" in label and "FAX番号" not in current_company_data:
                        current_company_data['FAX番号'] = value
                        print(f"📞 第{i+1}个元素 - FAX: {value}")
                    elif "メールアドレス" in label and "メールアドレス" not in current_company_data:
                        current_company_data['メールアドレス'] = value
                        print(f"📧 第{i+1}个元素 - メール: {value}")
            
            # 将找到的数据合并到data中
            data.update(current_company_data)
            
            # 确保所有字段都存在，如果不存在则设为空字符串
            required_fields = ['団体名', '住所', 'FAX番号', 'メールアドレス']
            for field in required_fields:
                if field not in data:
                    data[field] = ""
            
            return data
            
        except Exception as e:
            print(f"❌ 抓取企业信息失败 (尝试 {attempt + 1}/3): {company_url}, 错误: {e}")
            if attempt < 2:
                time.sleep(5)  # 等待5秒后重试
            else:
                return None
    
    return None

def process_company(company_url):
    """处理单个企业信息（线程安全）"""
    global processed_count
    
    info = get_company_info(company_url)
    if info:
        with data_lock:
            all_companies.append(info)
            processed_count += 1
            print(f"✅ [{processed_count}/{total_count}] {info.get('団体名', '未知企业')} - FAX: {info.get('FAX番号', 'N/A')}")
            print(f"📍 地址: {info.get('住所', 'N/A')}")  # 显示当前企业的地址
    
    return info

def process_page(page_num):
    """处理单个页面的所有企业（线程安全）"""
    print(f"🔄 开始处理第 {page_num} 页...")
    
    # 获取该页面的所有企业链接
    page_links = get_company_links(page_num)
    
    if not page_links:
        print(f"❌ 第 {page_num} 页没有找到企业链接")
        return []
    
    # 使用线程池处理该页面的所有企业，减少并发数
    with ThreadPoolExecutor(max_workers=3) as executor:
        # 提交所有任务
        future_to_url = {executor.submit(process_company, url): url for url in page_links}
        
        # 等待所有任务完成
        for future in as_completed(future_to_url):
            url = future_to_url[future]
            try:
                result = future.result()
                time.sleep(2)  # 每个企业处理后等待2秒
            except Exception as e:
                print(f"❌ 处理企业失败: {url}, 错误: {e}")
    
    print(f"✅ 第 {page_num} 页处理完成，找到 {len(page_links)} 个企业")
    return page_links

def save_progress(start_page, end_page):
    """保存当前进度"""
    global all_companies
    
    if all_companies:
        df = pd.DataFrame(all_companies)
        columns_order = ['団体名', '住所', 'FAX番号', 'メールアドレス', 'URL']
        df = df[columns_order]
        
        from datetime import datetime
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        csv_filename = f"gai-rou_companies_pages_{start_page}-{end_page}_{timestamp}.csv"
        
        df.to_csv(csv_filename, index=False, encoding="utf-8-sig")
        print(f"✅ 已保存 {len(all_companies)} 个企业数据到: {csv_filename}")
        return csv_filename
    return None

# 主程序
if __name__ == "__main__":
    # 解析命令行参数
    parser = argparse.ArgumentParser(description='抓取指定页面范围的企业信息')
    parser.add_argument('--start', type=int, default=1, help='起始页码 (默认: 1)')
    parser.add_argument('--end', type=int, default=185, help='结束页码 (默认: 185)')
    parser.add_argument('--workers', type=int, default=2, help='并发线程数 (默认: 2)')
    
    args = parser.parse_args()
    
    start_page = args.start
    end_page = args.end
    max_workers = args.workers
    
    print(f"🚀 开始抓取页面 {start_page} 到 {end_page} 的企业信息...")
    print(f"📊 总共需要处理 {end_page - start_page + 1} 页")
    print(f"⚙️ 并发线程数: {max_workers}")
    print(f"🔒 SSL验证: 已禁用")
    
    # 使用线程池处理页面，减少并发数
    with ThreadPoolExecutor(max_workers=max_workers) as page_executor:
        # 提交所有页面任务
        future_to_page = {page_executor.submit(process_page, page): page for page in range(start_page, end_page + 1)}
        
        # 等待所有页面处理完成
        for future in as_completed(future_to_page):
            page_num = future_to_page[future]
            try:
                page_links = future.result()
                total_count += len(page_links)
                time.sleep(5)  # 每页处理后等待5秒
            except Exception as e:
                print(f"❌ 处理第 {page_num} 页失败: {e}")
    
    # 保存最终结果
    print(f"\n🎉 页面 {start_page}-{end_page} 处理完成！")
    print(f"📊 总共处理了 {processed_count} 个企业")
    
    csv_filename = save_progress(start_page, end_page)
    
    if csv_filename:
        print(f"📁 文件大小: {os.path.getsize(csv_filename) / 1024:.1f} KB")
        
        # 显示数据预览
        df = pd.DataFrame(all_companies)
        columns_order = ['団体名', '住所', 'FAX番号', 'メールアドレス', 'URL']
        df = df[columns_order]
        print(f"\n📋 数据预览：")
        print(df.head())
    else:
        print("❌ 没有抓取到任何企业信息") 