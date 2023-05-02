import os

import networkx as nx
import pandas as pd


def compute_network_stats(graph, filename, save_to):
    # f = open(os.path.join(save_to, '.'.join((filename, 'txt'))), 'w',
    #           encoding='utf-8')
    # f.write(str(nx.info(graph)))
    # f.write('\n')

    # density
    # density = nx.density(graph)
    # f.write('Density of the network: ')
    # f.write(str(round(density, 4)))
    # f.write('\n')
    # print('density computed')
    # average clustering coefficient
    # a_clust = nx.average_clustering(graph)
    # f.write("Average clustering coefficient of the network: ")
    # f.write(str(round(a_clust, 4)))
    # f.write("\n")
    # print('average clustering coefficient computed')
    # number of strongly connected components and giant comoponent
    # components = nx.strongly_connected_components(graph)
    # components_no = nx.number_strongly_connected_components(graph)
    # f.write("Number of strongly connected components: ")
    # f.write(str(components_no))
    # f.write("\n")
    # largest_component = max(components, key=len)  # largest connected components
    # f.write("Size of the largest strongly connected component: ")
    # f.write(str(len(largest_component)))
    # f.write("\n")
    # number of weakly connected components
    # w_components = nx.weakly_connected_components(graph)
    # w_components_no = nx.number_weakly_connected_components(graph)
    # f.write("Number of weakly connected components: ")
    # f.write(str(w_components_no))
    # f.write("\n")
    # w_largest_component = max(w_components, key=len)  # largest connected components
    # f.write("Size of the largest weakly connected component: ")
    # f.write(str(len(w_largest_component)))
    # f.write("\n")
    # print('component computed')
    # compute degree centrality
    # degree_centrality_dict = dict(nx.degree_centrality(graph))
    # sorted_degree_centrality = rank(degree_centrality_dict)
    # f.write("\n")
    # f.write("Top 10 nodes by degree centrality: ")
    # f.write("\n")
    # for index, row in sorted_degree_centrality[:10].iterrows():
    #     f.write("\t")
    #     f.write(str(row['Gene']))
    #     f.write(" ")
    #     f.write(str(row['Value']))
    #     f.write("\n")
    # f.write("\n")
    # with open(os.path.join(save_to, '_'.join((filename, 'sorted degree centrality.txt'))), 'w') as f1:
    #     for index, row in sorted_degree_centrality.iterrows():
    #         f1.write(str(str(row['Gene'])))
    #         f1.write('\t')
    #         f1.write(str(row['Value']))
    #         f1.write('\t')
    #         f1.write(str(row['Rank']))
    #         f1.write("\n")
    # f1.close()
    print('degree centrality computed')
    # closeness centrality
    closeness_centrality_dict = dict(nx.closeness_centrality(graph))
    sorted_closeness_centrality = rank(closeness_centrality_dict)
    # f.write("\n")
    # f.write("Top 10 nodes by closeness centrality: ")
    # f.write("\n")
    # for index, row in sorted_closeness_centrality[:10].iterrows():
    #     f.write("\t")
    #     f.write(str(row['Gene']))
    #     f.write(" ")
    #     f.write(str(row['Value']))
    #     f.write("\n")
    # f.write("\n")
    # with open(os.path.join(save_to, '_'.join((filename, 'sorted closeness centrality.txt'))), 'w') as f1:
    #     for index, row in sorted_closeness_centrality.iterrows():
    #         f1.write(str(str(row['Gene'])))
    #         f1.write('\t')
    #         f1.write(str(row['Value']))
    #         f1.write('\t')
    #         f1.write(str(row['Rank']))
    #         f1.write("\n")
    # f1.close()
    # print('closeness centrality computed')
    # compute betweenness and eigenvector centralities
    # betweenness_dict = nx.betweenness_centrality(graph, weight='weight')
    # eigenvector_dict = nx.eigenvector_centrality(graph, max_iter=600, weight='weight')
    #
    # sorted_betweenness = rank(betweenness_dict)
    # with open(os.path.join(save_to, '_'.join((filename, 'sorted betweenness centrality.txt'))), 'w') as f1:
    #     for index, row in sorted_betweenness.iterrows():
    #         f1.write(str(str(row['Gene'])))
    #         f1.write('\t')
    #         f1.write(str(row['Value']))
    #         f1.write('\t')
    #         f1.write(str(row['Rank']))
    #         f1.write("\n")
    # f1.close()

    # f.write("Top 10 nodes by betweenness centrality: ")
    # f.write("\n")
    # for index, row in sorted_betweenness[:10].iterrows():
    #     f.write("\t")
    #     f.write(str(row['Gene']))
    #     f.write(" ")
    #     f.write(str(round(row['Value'], 4)))
    #     f.write("\n")
    # f.write("\n")
    # print('betweenness centrality computed')
    # sorted_eigenvector = rank(eigenvector_dict)
    # with open(os.path.join(save_to, '_'.join((filename, 'sorted eigenvector centrality.txt'))), 'w') as f1:
    #     for index, row in sorted_eigenvector.iterrows():
    #         f1.write(str(str(row['Gene'])))
    #         f1.write('\t')
    #         f1.write(str(row['Value']))
    #         f1.write('\t')
    #         f1.write(str(row['Rank']))
    #         f1.write("\n")
    # f1.close()
    # f.write("Top 10 nodes by eigenvector centrality: ")
    # f.write("\n")
    # for index, row in sorted_eigenvector[:10].iterrows():
    #     f.write("\t")
    #     f.write(str(row['Gene']))
    #     f.write(" ")
    #     f.write(str(round(row['Value'], 4)))
    #     f.write("\n")
    # print('eigenvector centrality computed')
    # degree, in-degree and out-degree
    # degree_dict = dict(graph.degree(graph.nodes()))
    # sorted_degree = rank(degree_dict)
    # f.write("\n")
    # f.write("Top 10 nodes by degree: ")
    # f.write("\n")
    # for index, row in sorted_degree[:10].iterrows():
    #     f.write("\t")
    #     f.write(str(row['Gene']))
    #     f.write(" ")
    #     f.write(str(row['Value']))
    #     f.write("\n")
    # f.write("\n")

    # with open(os.path.join(save_to, '_'.join((filename, 'sorted degree.txt'))), 'w') as f1:
    #     for index, row in sorted_degree.iterrows():
    #         f1.write(str(str(row['Gene'])))
    #         f1.write('\t')
    #         f1.write(str(row['Value']))
    #         f1.write('\t')
    #         f1.write(str(row['Rank']))
    #         f1.write("\n")
    # f1.close()
    # print('degree computed')
    # in_degree_dict = dict(graph.in_degree(graph.nodes()))
    # sorted_in_degree = rank(in_degree_dict)
    # f.write("Top 10 nodes by in_degree: ")
    # f.write("\n")
    # for index, row in sorted_in_degree[:10].iterrows():
    #     f.write("\t")
    #     f.write(str(row['Gene']))
    #     f.write(" ")
    #     f.write(str(row['Value']))
    #     f.write("\n")
    # f.write("\n")

    # with open(os.path.join(save_to, '_'.join((filename, 'sorted in_degree.txt'))), 'w') as f1:
    #     for index, row in sorted_in_degree.iterrows():
    #         f1.write(str(str(row['Gene'])))
    #         f1.write('\t')
    #         f1.write(str(row['Value']))
    #         f1.write('\t')
    #         f1.write(str(row['Rank']))
    #         f1.write("\n")
    # f1.close()
    # print('in-degree computed')
    out_degree_dict = dict(graph.out_degree(graph.nodes()))
    sorted_out_degree = rank(out_degree_dict)
    # f.write("Top 10 nodes by out_degree: ")
    # f.write("\n")
    # for index, row in sorted_out_degree[:10].iterrows():
    #     f.write("\t")
    #     f.write(str(row['Gene']))
    #     f.write(" ")
    #     f.write(str(row['Value']))
    #     f.write("\n")
    # f.write("\n")

    with open(os.path.join(save_to, '_'.join((filename, 'sorted out_degree.txt'))), 'w') as f1:
        for index, row in sorted_out_degree.iterrows():
            f1.write(str(str(row['Gene'])))
            f1.write('\t')
            f1.write(str(row['Value']))
            f1.write('\t')
            f1.write(str(row['Rank']))
            f1.write("\n")
    f1.close()
    print('out-degree computed')
    # computer pagerank
    # pr = nx.pagerank(graph, weight='weight')
    # sorted_pr = rank(pr)
    # with open(os.path.join(save_to, '_'.join((filename, 'sorted pagerank.txt'))),
    #           'w') as f1:
    #     for index, row in sorted_pr.iterrows():
    #         f1.write(str(str(row['Gene'])))
    #         f1.write('\t')
    #         f1.write(str(row['Value']))
    #         f1.write('\t')
    #         f1.write(str(row['Rank']))
    #         f1.write("\n")
    # f1.close()

    # f.write("\nTop 10 nodes by pagerank: ")
    # f.write("\n")
    # for index, row in sorted_pr[:10].iterrows():
    #     f.write("\t")
    #     f.write(str(row['Gene']))
    #     f.write(" ")
    #     f.write(str(round(row['Value'], 4)))
    #     f.write("\n")
    # print("pagerank computed")

    # close the file
    # f.close()

def rank(dict):
    sorted_dict = {k: v for k, v in sorted(dict.items(), key=lambda item: item[1], reverse=True)}
    key = list(sorted_dict.keys())
    value = list(sorted_dict.values())
    ranking_ls = []
    current_value = 10000
    current_index = 0
    for index, p in enumerate(value, start=1):
        if p < current_value:
            current_index = index
        ranking_ls.append(current_index)
        current_value = p

    ranking_df = pd.DataFrame()
    for i in range(len(key)):
        data = pd.DataFrame({'Gene': [key[i]], 'Value': [value[i]], 'Rank': [ranking_ls[i]]})
        ranking_df = pd.concat([ranking_df, data])

    return ranking_df