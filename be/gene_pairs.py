import random
from random import sample
import pandas as pd

import networkx as nx

from target_combination.HogwartsPrune import generate_target_sets


def get_gene_pairs(genes, cancer_type, K, M=2, read_results = True):
    if read_results:
        df = pd.read_csv('input/{}set_combo_{}.csv'.format(M, cancer_type))
        df = df.rename({'Unnamed: 0': 'gene1', 'Unnamed: 1': 'gene2'}, axis='columns')
        df = df.loc[(df.pdist_oncogenes - df.distance).sort_values(ascending=True, na_position='last').index]
        # df = df.sort_values(by='pdist_oncogenes', ascending=False)
        # df = df[(df['pdist'] > 0.2) & (df['pdist'] < 0.4)]
        print(df[['gene1','gene2','pdist_oncogenes','distance']][:K])
        return [list([x[0], x[1], round(x[2],3), round(x[3],3)]) for x in list(df[['gene1','gene2','pdist_oncogenes','distance']][:K].values)]

    return generate_target_sets(genes, cancer_type, K, M)
    # g = nx.read_gexf('input/whole_signaling.gexf')
    # for m in range(M):
    #     genes = sample(list(g.nodes()), K)
    #     genes.append(round(random.random(),3))
    #     genes.append(round(random.random(),3))
    #     ans.append(genes)
    # return ans


# if __name__ == '__main__':
#     p, n = get_gene_pairs("")
#     print(p)
#     print(n)
