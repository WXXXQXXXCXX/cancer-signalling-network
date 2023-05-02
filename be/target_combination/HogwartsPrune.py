import json
from statistics import mean

import numpy as np
from target_combination import HogwartsHallmarkAnalysis as hallmark
from target_combination import HogwartsPDist as pdist
from target_combination import HogwartsDistance as dist
from target_combination.HogwartsCancerType import *
from target_combination import HogwartsStat as stats

import itertools
import os

def constructNetwork(nodeset, targetset, g, cancer_name):  # construct cancer network
    temp1 = nodeset.copy()  # nodeset is the set of oncogenes of this kind of cancer type
    nodeset1 = []
    for u in temp1:
        if u in g.nodes():
            nodeset1.append(u)  # remove the oncogenes which are not in the network
    temp2 = targetset.copy()  # target set is the set of drug targets for the input cancer type
    targetset1 = []
    for v in temp2:
        if v in g.nodes():
            targetset1.append(v)  # remove the targets which are not in the network
    print('There are {} cancer genes and {} targets'.format(len(nodeset1), len(targetset1)))
    new_nodes = set()
    count = 0
    # if there is at least one path from a target u to oncogene v
    # if the shortest path length <= 5, add the paths with the length <=5 to the network
    # else, add all the paths from u to v to the network.
    for u in targetset1:
        for v in nodeset1:
            print(u,v,'has path')
            if nx.has_path(g, u, v):
                print(u, v, 'shortest path')
                lp = nx.shortest_path_length(g, u, v)
                # print('length of the shortest path between {} and {} is {}'.format(u,v,lp))
                if lp <= 5:
                    print(u, v, 'all path')
                    temp = nx.all_simple_paths(g, u, v, 5)
                else:
                    print(u, v, 'all path')
                    temp = nx.all_simple_paths(g, u, v, lp)
                for p in temp:
                    new_nodes.update(p)
            # if there is no path from target u to oncogene v, add u and v to network only.
            else:
                new_nodes.update({u, v})

                # construct cancer network
    cancer_network = nx.subgraph(g, new_nodes)
    cancer_network_1 = cancer_network.copy()

    for i in [f'{output_path}/prune/{cancer_name}/ppr',
              f'{output_path}/prune/{cancer_name}/dppr',
              f'{output_path}/prune/{cancer_name}/pdist',
              f'{output_path}/prune/{cancer_name}/stats',
              f'{output_path}/prune/{cancer_name}/distance']:
        if not os.path.exists(i):
            os.makedirs(i)
    # write the network to gexf file
    nx.write_gexf(cancer_network_1, f'{output_path}/prune/{cancer_name}/{cancer_name}.gexf')
    # compute the topological features of the network
    stats.compute_network_stats(cancer_network_1, cancer_name, f'{output_path}/prune/{cancer_name}/stats')

    # compute the pdist of the network
    pdist.pdist_alpha(cancer_network_1,
                      f'{output_path}/prune/{cancer_name}/ppr',
                      f'{output_path}/prune/{cancer_name}/stats',
                      cancer_name, f'{output_path}/prune/{cancer_name}/dppr',
                      f'{output_path}/prune/{cancer_name}/pdist', iter=2)
    dist.compute_shortest_distance(cancer_network_1,f'{output_path}/prune/{cancer_name}/distance')

    return cancer_network_1



def pruneByHallMarks_s(cancer_network, targetset):  # prune single candidate by hallmarks
    candidate = []
    temp = targetset.copy()  # target set for the input cancer type
    for u in temp:
        if u not in cancer_network.nodes():
            targetset.remove(u)  # remove oncogene which are not in cancer network.
    cancer_target_hallmark = hallmark.target_hallmarks.loc[targetset, :]
    hallmark_binary = list(
        hallmark.targets_analysis(target_hallmarks_df=cancer_target_hallmark).index)  # hallmarks for known targets
    for u in cancer_network.nodes():
        temp_str = ''
        for h in hallmark.hallMarks_df.columns[1:]:
            temp_str = ''.join([temp_str, str(hallmark.hallMarks_df.loc[u, h])])
        if temp_str in hallmark_binary:  # if nodes in cancer network have the same hallmarks as known targets
            candidate.append(u)  # add to candidates list
    candidate = list(set(candidate))
    return candidate


def pruneByPdist_s(nodeset, targetset, candidate, network, cancer_name):  # prune target candidates by pdistance
    temp = nodeset.copy()
    for u in temp:
        if u not in network.nodes():
            nodeset.remove(u)
    temp = targetset.copy()
    for u in temp:
        if u not in network.nodes():
            targetset.remove(u)
    candidate_by_pdist = candidate.copy()
    pdist = pd.read_csv(f'{prune_path}/{cancer_name}/pdist/alpha = 0.2/pdist.txt', sep='\t',
                        header=0, index_col=0)  # read pdist.txt file to dataframe
    target_pdist = pdist.loc[targetset, nodeset]  # extract target-oncogene
    target_check_bytarget = (target_pdist == 12.5129).all(
        axis=1)  # check if no connection from a target to all oncogenes
    # prune out the targets which have no connection to any of the oncogenes
    for t in targetset:
        if target_check_bytarget[t]:
            target_pdist.drop(index=t, inplace=True)
    max_pdist = pd.Series(index=nodeset, dtype='float64')
    min_pdist = pd.Series(index=nodeset, dtype='float64')
    abs_max = pd.Series(index=nodeset, dtype='float64')
    # if the pdist between the candidate and oncogenes out of the threshold range, prune it out
    for u in nodeset:
        q1 = target_pdist.loc[:, u].quantile(0.25)  # 1st quantile
        q3 = target_pdist.loc[:, u].quantile(0.75)  # 3rd quantile
        iqr = q3 - q1  # inter quantile range
        max_temp = target_pdist.loc[:, u].max()  # maximum
        min_temp = target_pdist.loc[:, u].min()  # minimum
        upperbound = q3 + 1.5 * iqr
        lowerbound = q1 - 1.5 * iqr
        max_pdist[u] = min(max_temp, upperbound)  # upper threshold
        min_pdist[u] = max(min_temp, lowerbound)  # lower threshold
        abs_max[u] = 10
    for v in candidate:
        for p in nodeset:
            if (pdist.loc[v, p] == 12.5129) and (max_pdist[p] != 12.5129):
                candidate_by_pdist.remove(v)
                break

    return candidate_by_pdist


def jaccard_binary(x, y):
    """A function for finding the similarity between two binary vectors"""
    intersection = np.logical_and(x, y)
    union = np.logical_or(x, y)
    similarity = intersection.sum() / float(union.sum())
    return similarity


def sortByPdist(candidates, k, nodeset, targetset,cancer_network, cancer_name, m):  # sort the candidate combination

    temp = nodeset.copy()
    for u in temp:
        if u not in cancer_network.nodes():
            nodeset.remove(u)
    targets = targetset.copy()
    for u in targets:
        if u not in cancer_network.nodes():
            targetset.remove(u)
    # import pdist dataset
    cancer_pdist_path = f'{prune_path}/{cancer_name}/pdist/alpha = 0.2'
    cancer_dist_path = f'{prune_path}/{cancer_name}/distance'
    pdist_df = pd.read_csv(f'{cancer_pdist_path}/pdist.txt', sep='\t', index_col=0, header=0)
    dist_df = pd.read_csv(f'{cancer_dist_path}/distance.txt',sep='\t', index_col = 0, header = 0)
    oncogene_pdist = pdist_df.loc[:, nodeset]
    othernodes = []
    for u in cancer_network.nodes():
        if u not in nodeset:
            othernodes.append(u)
    other_pdist = pdist_df.loc[:, othernodes]
    # analyze the hallmarks of known drug targets
    # for each drug with k targets for the input cancer type
    # compute jaccard similarity index for each pair of targets of this drug
    # then compute the mean similarity of the targets in this drug
    # hallmark_k = hallmark.drug_hallmarks[hallmark.drug_hallmarks['No. of Targets'] == k]  # drugs with k targets
    hallmark_k = hallmark.drug_hallmarks.copy()
    drug_hallmark_k = hallmark.drug_hallmarks.copy()

    for i in hallmark_k.index:
        if type(hallmark_k.loc[i, 'Indications']) == str:
            if cancer_name.lower() not in hallmark_k.loc[i, 'Indications'].lower():
                drug_hallmark_k.drop(index=i, inplace=True)  # drugs with k targets for the input cancer type
        else:
            drug_hallmark_k.drop(index=i, inplace=True)

    # drug_summary = pd.DataFrame(index=drug_hallmark_k.index) # summary of drug's hallmark similarity and pdist
    # for drug in drug_hallmark_k.index:
    #     temp_similarity = []
    #     temp_target1 = hallmark.drug_targets.loc[
    #         drug, 'Targets']  # store the similarity for each pair of targets in drug
    #
    #     temp_target = temp_target1.copy()
    #     for t in temp_target1:
    #         if t not in cancer_network.nodes():
    #             temp_target.remove(t)
    #     po1 = []
    #     pr1 = []
    #     if len(temp_target) > 0:
    #         for tc in itertools.combinations(temp_target, 2):  # for each pair of targets in a drug
    #
    #             h1 = list(hallmark.target_hallmarks.loc[tc[0]][0:-1])  # hallmarks for one target
    #             h2 = list(hallmark.target_hallmarks.loc[tc[1]][0:-1])  # hallmarks for another target
    #             h1_h2 = jaccard_binary(h1, h2)  # compute similarity
    #             temp_similarity.append(h1_h2)  # add the similarity to the temp dataframe
    #     if not len(temp_similarity) == 0:
    #         drug_summary.loc[drug, 'Mean Similarity'] = mean(temp_similarity)  # compute the mean
    #
    #     # distance between targets
    #     temp_distance = []
    #     if len(temp_target) > 0:
    #         for t in temp_target:
    #
    #             po1.append(mean(oncogene_pdist.loc[t, :]))
    #             pr1.append(mean(other_pdist.loc[t, :]))
    #         if (len(po1) > 0) and (len(pr1) > 0):
    #             mean_po = mean(po1)
    #             mean_pr = mean(pr1)
    #             diff = mean_pr - mean_po  # difference between pdistance to oncogenes and other nodes
    #             drug_summary.loc[drug,'pdist_to_oncogenes'] = mean_po
    #             drug_summary.loc[drug,'pdist_to_othergenes'] = mean_pr
    #             drug_summary.loc[drug, 'pdist_score'] = (diff ** 2) / mean_po
    #
    #         for tar1 in temp_target:
    #             for tar2 in temp_target:
    #                 temp_distance.append(dist_df.loc[tar1,tar2])
    #         drug_summary.loc[drug,'mean distance'] = mean(temp_distance)
    #
    #     # overlapping
    #     overlapping_count = 0
    #     for t in temp_target:
    #         if t in nodeset:
    #             overlapping_count += 1
    #     drug_summary.loc[drug,'overlapping count'] = overlapping_count
    # drug_summary.to_csv(f'{prune_path}//{cancer_name}//drug_summary.csv', header=True, index=True, sep=',')

    pdist_oncogenes = {}
    pdist_othergenes = {}
    pdist_scores = {}
    similarity_scores = {}
    distance_scores = {}
    overlapping_scores = {}
    count = 0
    for subset in itertools.combinations(candidates, k):
        # hallmark score:
        temp_similarity1 = []
        for tc in itertools.combinations(subset, 2):
            h1 = list(hallmark.hallMarks_df.loc[tc[0]][1:])  # hallmarks for one target
            h2 = list(hallmark.hallMarks_df.loc[tc[1]][1:])  # hallmarks for another target
            h1_h2 = jaccard_binary(h1, h2)  # compute similarity
            temp_similarity1.append(h1_h2)  # add the similarity to the temp dataframe
        similarity_scores[subset] = mean(temp_similarity1)  # compute the mean
        po = []  # pdistance to oncogenes
        pr = []  # pdistance to rest genes
        distance_1 = []
        overlapping_count1 = 0
        for u in subset:
            po.append(mean(oncogene_pdist.loc[u, :]))
            pr.append(mean(other_pdist.loc[u, :]))
            if u in nodeset:
                overlapping_count1 += 1
            for v in subset:
                distance_1.append(dist_df.loc[u,v])
        mean_po = mean(po)
        mean_pr = mean(pr)
        diff = mean_pr - mean_po  # difference between pdistance to oncogenes and other nodes
        mean_distance = mean(distance_1)
        pdist_oncogenes[subset] = mean_po
        pdist_othergenes[subset] = mean_pr
        pdist_scores[subset] = (diff ** 2) / mean_po
        distance_scores[subset] = mean_distance
        overlapping_scores[subset] = overlapping_count1


        count += 1
        print(f'{count},{subset}')

    cs_df = pd.concat([pd.Series(d) for d in [similarity_scores, pdist_scores, pdist_oncogenes,pdist_othergenes,distance_scores,overlapping_scores]], axis=1)
    cs_df.columns = ['similarity', 'pdist', 'pdist_oncogenes', 'pdist_othergenes','distance','overlapping']
    cs_df.to_csv(f'{prune_path}//{cancer_name}//{k}set_combo.csv', header=True, index=True, sep=',')
    return cs_df

    # cs_df.to_csv(f'{prune_path}//{cancer_name}//{k}set_combo.csv', header=True, index=True, sep=',')
    # cs_df = pd.read_csv(f'{prune_path}//{cancer_name}//{k}set_combo.csv', header=0, index_col=[0,1], sep=',')
    # known_targets = pd.DataFrame()
    # for drug in drug_hallmark_k.index:
    #     temp_target1 = hallmark.drug_targets.loc[
    #         drug, 'Targets']  # store the similarity for each pair of targets in drug
    #
    #     temp_target = temp_target1.copy()
    #     for t in temp_target1:
    #         if t not in cancer_network.nodes():
    #             temp_target.remove(t)
    #     for subset in itertools.combinations(temp_target,k):
    #         if subset in cs_df.index:
    #             known_targets[subset] = cs_df.T[subset]
    # known_targets = known_targets.T
    # known_targets.to_csv(f'{prune_path}//{cancer_name}//known_targets.csv', header=True, index=True, sep=',')

def generate_target_sets(onco, cancer_name, k=2, m=5):
    # oncogene, whole_signaling
    breast_onco, prostate_onco, breast_target, prostate_target, breast_nontarget, prostate_nontarget = find_subgene(
        whole_signaling)
    target_set = breast_target
    if cancer_name == 'prostate':
        target_set = prostate_target
    onco_network = constructNetwork(onco, target_set, whole_signaling, cancer_name)

    target_in_network = target_set.copy()
    t_in_network = 0
    for u in target_set:
        if u not in onco_network.nodes():
            target_in_network.remove(u)
        else:
            t_in_network += 1

    candidate1 = pruneByHallMarks_s(onco_network, targetset=target_set)

    t1_in_network = 0
    for u in candidate1:
        if u in target_set:
            t1_in_network += 1

    candidate3 = pruneByPdist_s(prostate_onco, target_set, candidate1, onco_network, cancer_name)
    sortByPdist(candidate3, k, prostate_onco, target_set, onco_network, cancer_name, 10)
    cs_df = pd.read_csv(f'{prune_path}//{cancer_name}//{k}set_combo.csv')
    cs_df = cs_df.loc[(cs_df.pdist_oncogenes - cs_df.distance).sort_values(ascending=True, na_position='last').index]
    cs_df = cs_df.rename({'Unnamed: 0': 'gene1', 'Unnamed: 1': 'gene2'}, axis='columns')
    return [list([x[0], x[1], round(x[2], 3), round(x[3], 3)]) for x in
            list(cs_df[['gene1', 'gene2', 'pdist_oncogenes', 'distance']][:m].values)]

if __name__ == '__main__':
    #print(generate_target_sets([], 'breast'))
    with open('/Users/qiaochuwang/Downloads/cancer-signalling-network/public/wg1.json', 'r') as fp:
        data = json.load(fp)

    with open('wg.csv', 'w') as fp:
        for i in data['nodes']:
            fp.write('{},{},{}\n'.format(i['id'], i['x'], i['y']))
