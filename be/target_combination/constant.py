import pandas as pd
import os

project_path = './target_combination'
output_path = os.path.join(project_path, 'output', 'Signaling Network')  # output path
input_path = os.path.join(project_path, 'input')  # input path
prune_path = os.path.join(output_path,'prune')

target_df = pd.read_csv(os.path.join(input_path, 'Drug targets.csv'), encoding="unicode_escape")
common_path = os.path.join(input_path, 'common files')  # the dir of common files
cancer_df = pd.read_csv(os.path.join(input_path, 'oncogene.csv'), encoding='unicode_escape')

target_raw = list(target_df['Targets'])
target_ls = []
for tg in target_raw:
    if type(tg) == str:
        temp = tg.split('; ')
        target_ls.extend(temp)
target_ls = list(set(target_ls))