import pandas as pd
import os
import glob
from datetime import datetime

def merge_page_files():
    """合并所有分页数据文件"""
    
    # 查找所有分页数据文件
    pattern = "gai-rou_companies_pages_*.csv"
    csv_files = glob.glob(pattern)
    
    if not csv_files:
        print("❌ 没有找到分页数据文件")
        print(f"📁 当前目录: {os.getcwd()}")
        print(f"🔍 查找模式: {pattern}")
        return None
    
    # 按文件名排序
    csv_files.sort()
    
    print(f"📁 找到 {len(csv_files)} 个分页数据文件:")
    for i, file in enumerate(csv_files, 1):
        file_size = os.path.getsize(file) / 1024  # KB
        print(f"   {i}. {file} ({file_size:.1f} KB)")
    
    # 读取并合并所有文件
    all_dataframes = []
    total_rows = 0
    
    for file in csv_files:
        try:
            df = pd.read_csv(file, encoding='utf-8-sig')
            all_dataframes.append(df)
            total_rows += len(df)
            print(f"✅ 读取 {file}: {len(df)} 行")
        except Exception as e:
            print(f"❌ 读取 {file} 失败: {e}")
    
    if not all_dataframes:
        print("❌ 没有成功读取任何文件")
        return None
    
    # 合并所有数据框
    merged_df = pd.concat(all_dataframes, ignore_index=True)
    
    # 去重（基于URL）
    before_dedup = len(merged_df)
    merged_df = merged_df.drop_duplicates(subset=['URL'], keep='first')
    after_dedup = len(merged_df)
    
    print(f"\n📊 合并统计:")
    print(f"   合并前总行数: {before_dedup}")
    print(f"   去重后总行数: {after_dedup}")
    print(f"   去重数量: {before_dedup - after_dedup}")
    
    # 重新排列列的顺序
    columns_order = ['団体名', '住所', 'FAX番号', 'メールアドレス', 'URL']
    merged_df = merged_df[columns_order]
    
    # 生成合并文件名
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    output_filename = f"gai-rou_companies_merged_{timestamp}.csv"
    
    # 保存合并后的文件
    merged_df.to_csv(output_filename, index=False, encoding="utf-8-sig")
    print(f"\n✅ 合并文件已保存: {output_filename}")
    print(f"📁 文件大小: {os.path.getsize(output_filename) / 1024:.1f} KB")
    
    # 显示数据预览
    print(f"\n📋 合并后数据预览:")
    print(merged_df.head())
    
    # 显示统计信息
    print(f"\n📈 数据统计:")
    print(f"   总企业数: {len(merged_df)}")
    print(f"   有地址的企业: {len(merged_df[merged_df['住所'] != ''])}")
    print(f"   有FAX的企业: {len(merged_df[merged_df['FAX番号'] != ''])}")
    print(f"   有邮箱的企业: {len(merged_df[merged_df['メールアドレス'] != ''])}")
    
    return output_filename

def merge_specific_files(file_patterns):
    """合并指定模式的文件"""
    all_files = []
    for pattern in file_patterns:
        files = glob.glob(pattern)
        all_files.extend(files)
    
    if not all_files:
        print("❌ 没有找到指定模式的文件")
        return None
    
    # 去重并排序
    all_files = sorted(list(set(all_files)))
    
    print(f"📁 找到 {len(all_files)} 个文件:")
    for file in all_files:
        print(f"   - {file}")
    
    # 读取并合并
    all_dataframes = []
    for file in all_files:
        try:
            df = pd.read_csv(file, encoding='utf-8-sig')
            all_dataframes.append(df)
            print(f"✅ 读取 {file}: {len(df)} 行")
        except Exception as e:
            print(f"❌ 读取 {file} 失败: {e}")
    
    if not all_dataframes:
        print("❌ 没有成功读取任何文件")
        return None
    
    # 合并数据
    merged_df = pd.concat(all_dataframes, ignore_index=True)
    
    # 去重
    before_dedup = len(merged_df)
    merged_df = merged_df.drop_duplicates(subset=['URL'], keep='first')
    after_dedup = len(merged_df)
    
    print(f"\n📊 合并统计:")
    print(f"   合并前: {before_dedup} 行")
    print(f"   去重后: {after_dedup} 行")
    print(f"   去重: {before_dedup - after_dedup} 行")
    
    # 保存
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    output_filename = f"gai-rou_companies_custom_merged_{timestamp}.csv"
    
    columns_order = ['団体名', '住所', 'FAX番号', 'メールアドレス', 'URL']
    merged_df = merged_df[columns_order]
    merged_df.to_csv(output_filename, index=False, encoding="utf-8-sig")
    
    print(f"✅ 合并文件已保存: {output_filename}")
    return output_filename

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1:
        # 如果提供了文件模式参数
        patterns = sys.argv[1:]
        print(f"🔍 使用指定的文件模式: {patterns}")
        merge_specific_files(patterns)
    else:
        # 默认合并所有分页文件
        print("🔄 开始合并所有分页数据文件...")
        merge_page_files()