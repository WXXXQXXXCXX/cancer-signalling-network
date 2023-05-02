import networkx as nx

from target_combination.constant import *


'''Comparing topological features in different cancer subtypes'''

# read graph
whole_signaling = nx.read_gexf(os.path.join(input_path, 'whole_signaling.gexf'))

# find genes for cancer subtypes:
def find_subgene(network):
    prostate_onco_ = []  # oncogenes of prostate cancer
    breast_onco_ = []  # oncogenes of breast cancer
    prostate_target_ = []  # drug targets for prostate cancer
    breast_target_ = []  # drug targets for breast cancer

    # find oncogenes for each cancer subtype from cancer gene census dataframe ()
    for index, row in cancer_df.iterrows():
        if 'prostate' in str(row['Tumour Types(Somatic)']) or 'prostate' in str(row['Tumour Types(Germline)']):
            if row['Gene Symbol'] in network.nodes():  # remove those not in signaling network
                prostate_onco_.append(row['Gene Symbol'])
        if 'breast' in str(row['Tumour Types(Somatic)']) or 'prostate' in str(row['Tumour Types(Germline)']):
            if row['Gene Symbol'] in network.nodes():  # remove those not in signaling network
                breast_onco_.append(row['Gene Symbol'])
    # find target genes for each cancer subtype
    for index, row in target_df.iterrows():
        if 'Prostate Cancer' in str(row['Indications']) or 'prostate cancer' in str(row['Indications']):
            temp = str(row['Targets']).split('; ')
            for gene in temp:
                if gene in network.nodes():
                    prostate_target_.append(gene)
        if 'Breast Cancer' in str(row['Indications']) or 'breast cancer' in str(row['Indications']):
            temp = str(row['Targets']).split('; ')
            for gene in temp:
                if gene in network.nodes():
                    breast_target_.append(gene)
    prostate_target_ = list(set(prostate_target_))  # remove redundant elements from the list
    breast_target_ = list(set(breast_target_))  # remove redundant elements from the list
    prostate_nontarget_ = []  # genes in signaling network which are not prostate cancer targets
    breast_nontarget_ = []  # genes in signaling network which are not breast cancer targets
    for u in network.nodes():
        if not u in prostate_target_:
            prostate_nontarget_.append(u)
        if not u in breast_target_:
            breast_nontarget_.append(u)
    return breast_onco_, prostate_onco_, breast_target_, prostate_target_, breast_nontarget_, prostate_nontarget_

