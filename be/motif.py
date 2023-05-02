import collections
import heapq
import math
from collections import defaultdict
import time

import networkx as nx


class MotifFinding:
    def __init__(self, data, min_clique_size):
        adj = {}
        for n in data['nodes']:
            adj[n['key']] = []
        for e in data['edges']:
            adj[e['source']].append(e['target'])
            if e['source'] == e['target']:
                continue
            adj[e['target']].append(e['source'])
        self.pathway_groups = []
        for p, nodes in data['pathway'].items():
            self.pathway_groups.append((p, nodes))
        self.data = data
        print(self.pathway_groups)

        self.adj = adj
        self.G = nx.Graph(adj)
        print(self.G.nodes)
        t = time.time()
        self.pos = calc_posotion(self.G)
        tt = time.time()
        self.TLOC = tt-t
        self.min_clique_size = min_clique_size
        self.id = len(adj) + 1

        self.fans = []
        self.d_connectors = []
        self.cliques = []
        self.groups = {}
        self.V = len(self.G.nodes)
        self.E = len(self.G.edges)


        self.COG_LOAD = self.E+2*self.E/(self.V*(self.V-1))+max(self.E-3*self.V+6, 0)
        self.percent = []

    def bors_kerbosch_v2(self, R, P, X, G, C):

        if len(P) == 0 and len(X) == 0:
            if len(R) > 2:
                C.append(sorted(R))
            return

        (d, pivot) = max([(len(G[v]), v) for v in P.union(X)])

        for v in P.difference(G[pivot]):
            self.bors_kerbosch_v2(R.union({v}), P.intersection(G[v]), X.intersection(G[v]), G, C)
            P.remove(v)
            X.add(v)

    def _find_cliques_2(self):

        G = collections.defaultdict(set)
        for (src, dest) in self.G.edges:
            if src != dest:
                G[src].add(dest)
                G[dest].add(src)
        # pprint(G)
        C2 = []
        self.bors_kerbosch_v2(set([]), set(G.keys()), set([]), G, C2)
        return sorted(C2, key=lambda x: len(x), reverse=True)

    def _find_cliques(self):

        p = set(self.adj.keys())
        r = set()
        x = set()
        cliques = []
        for v in self._degeneracy_ordering():
            neighs = self.adj[v]
            self._find_clique_pivot(r.union([v]), p.intersection(neighs), x.intersection(neighs), cliques)
            p.remove(v)
            x.add(v)

        cliques = sorted([i for i in cliques if len(i) >= self.min_clique_size], key=lambda x: len(x), reverse=True)
        return cliques

    def _find_clique_pivot(self, r, p, x, cliques):
        if len(p) == 0 and len(x) == 0:
            cliques.append(r)
        else:
            u = next(iter(p.union(x)))
            for v in p.difference(self.adj[u]):
                neighs = self.adj[v]
                self._find_clique_pivot(r.union([v]), p.intersection(neighs), x.intersection(neighs), cliques)
                p.remove(v)
                x.add(v)

    def _degeneracy_ordering(self):
        ordering = []
        ordering_set = set()
        degrees = defaultdict(lambda: 0)
        degen = defaultdict(list)
        max_deg = -1
        for v in self.adj:
            deg = len(self.adj[v])
            degen[deg].append(v)
            degrees[v] = deg
            if deg > max_deg:
                max_deg = deg

        while True:
            i = 0
            while i <= max_deg:
                if len(degen[i]) != 0:
                    break
                i += 1
            else:
                break
            v = degen[i].pop()
            ordering.append(v)
            ordering_set.add(v)
            for w in self.adj[v]:
                if w not in ordering_set:
                    deg = degrees[w]
                    degen[deg].remove(w)
                    if deg > 0:
                        degrees[w] -= 1
                        degen[deg - 1].append(w)

        ordering.reverse()
        return ordering

    def _update_graph(self, motif):
        nodes = sorted(list(motif))
        for i in nodes[1:]:

            self.G = nx.contracted_nodes(self.G, nodes[0], i)

        self.G = nx.relabel_nodes(self.G, {nodes[0]: str(self.id)})

    def _is_valid(self, l, type):

        return (l >= self.min_clique_size and type == 'clique') \
               or (l > 1 and type == 'fan') or (l > 1 and type == 'connector') or (l > 4 and 'R-HSA' in type)

    def _add_connector(self, out, used, connector):
        spanners = connector[1]
        anchors = connector[0]

        curr_c_str = '{}|{}'.format(' '.join(sorted(list(anchors))), ' '.join(sorted(list(spanners))))
        out.add(curr_c_str)
        for i in spanners:
            used[i] = connector
        for i in anchors:
            used[i] = connector

    def _find_connectors(self):
        # key is str(anchors), value is a tuple, set(set(anchors), set(spans))
        found = {}
        for node, neighbor in self.adj.items():
            if len(neighbor) < 2:
                continue
            for nbr in neighbor:
                if len(self.adj[nbr]) < 2:
                    continue
                anchors = sorted(neighbor)
                key = str(anchors)
                if found.get(key) is None:
                    found[key] = (set(anchors), set())
                found[key][1].add(node)

        out = set()
        used = {}

        for connector in found.values():
            spanners = connector[1]
            anchors = connector[0]
            if len(spanners) < 2:
                continue
            for s in spanners:
                if s in used.keys():
                    prev_c = used[s]
                    prev_c_tot = len(prev_c[0]) + len(prev_c[1])
                    curr_c_tot = len(spanners) + len(anchors)
                    if prev_c_tot < curr_c_tot or (curr_c_tot == prev_c_tot and len(spanners) > len(prev_c[1])):
                        prev_c_str = '{}|{}'.format(' '.join(sorted(list(prev_c[0]))),' '.join(sorted(list(prev_c[1]))))
                        out.remove(prev_c_str)
                        for i in prev_c[0]:
                            used.pop(i, None)
                        for i in prev_c[1]:
                            used.pop(i, None)
                        self._add_connector(out, used, connector)
                    continue
            self._add_connector(out, used, connector)
        connectors = []
        for c_str in out:
            [anchors, spanners] = c_str.split('|')
            connectors.append((set(anchors.split(' ')), set(spanners.split(' '))))
        # print('self._find_connectors() return ', connectors)
        return connectors

    def _find_pathways(self):
        out = set()
        used = {}

        for p in self.pathway_groups:
            nodes = p[1]
            pid = p[0]
            overlap=False
            for node in nodes:
                if node in used.keys():
                    overlap=True
                    prev_c = used[node]
                    if len(prev_c[1]) < len(nodes):

                        prev_c_str = '{}|{}'.format(' '.join(sorted(list(prev_c[1]))), prev_c[0])
                        #print(prev_c_str, out)
                        out.remove(prev_c_str)
                        for i in prev_c[1]:
                            used.pop(i, None)
                        curr_c_str = '{}|{}'.format(' '.join(sorted(list(nodes))), pid)
                        out.add(curr_c_str)
                        for i in nodes:
                            used[i] = p
                    continue
            if not overlap:
                curr_c_str = '{}|{}'.format(' '.join(sorted(list(nodes))), pid)
                out.add(curr_c_str)
                for i in nodes:
                    used[i] = p
        for p_str in out:
            [nodes, pid] = p_str.split('|')
            nodes = nodes.split(' ')
            #print(nodes, pid)
            self._update_graph(nodes)
            self._format_one((str(self.id), nodes), pid)

            v = len(self.G.nodes)
            e = len(self.G.edges)
            cog = e + 2 * e / (v * (v - 1)) + max(e - 3 * v + 6, 0)
            self.percent.append([str(self.id), round(math.log(cog) / math.log(self.COG_LOAD), 3)])

            self.id += 1

    def _remove_overlap_motifs(self, cliques):
        out = set()
        used = {}

        for c in cliques:
            # print(out)
            overlap = False
            for node in c:
                if used.get(node)!=None:
                    overlap = True
                    prev_c = used[node]
                    if len(prev_c) < len(c):
                        prev_c_str = ' '.join(sorted(list(prev_c)))
                        #print(prev_c_str, out)
                        if prev_c_str in out:
                            out.remove(prev_c_str)
                        for i in prev_c:
                            c_rmv = used.pop(i, None)
                            if c_rmv != None:
                                c_rmv_str = ' '.join(sorted(list(c_rmv)))
                                if c_rmv_str in out:
                                    out.remove(c_rmv_str)
                        curr_c_str = ' '.join(sorted(list(c)))
                        out.add(curr_c_str)
                        for i in c:
                            if used.get(i) != None:
                                rmv_str = ' '.join(sorted(list(used[i])))
                                if rmv_str in out:
                                    out.remove(rmv_str)
                            used[i] = c
                    break
            if not overlap:
                curr_c_str = ' '.join(sorted(list(c)))
                out.add(curr_c_str)
                for i in c:
                    used[i] = c
        for nodes in out:
            nodes = nodes.split(' ')
            # print(nodes)
            self._update_graph(nodes)
            self._format_one((str(self.id), nodes), 'clique')

            v = len(self.G.nodes)
            e = len(self.G.edges)
            cog = e + 2 * e / (v * (v - 1)) + max(e - 3 * v + 6, 0)
            self.percent.append([str(self.id), round(math.log(cog) / math.log(self.COG_LOAD), 3)])
            self.id += 1




    def _find_motifs(self, include_pathways = False):
        fans = []
        motifs = []
        #print("before: ",self.id)
        if include_pathways:
            # for pathway in self.pathway_groups:
            #     nodes = pathway[1]
            #     id = pathway[0]
            #     heapq.heappush(motifs, (-len(nodes)*3, set(nodes), id))
            self._find_pathways()
            return
        # fan motifs
        motif_vis = set()
        for node, neighbors in self.adj.items():
            leaves = []
            if len(neighbors) <= 1:
                continue

            for other in neighbors:
                if len(self.adj[other]) == 1:
                    leaves.append(other)
            if len(leaves) > 2:
                fans.append((node, leaves))

                self._update_graph(leaves)
                self._format_one((str(self.id), leaves), 'fan')
                motif_vis = motif_vis.union(set(leaves))
                v = len(self.G.nodes)
                e = len(self.G.edges)
                cog = e+2*e/(v*(v-1))+max(e-3*v+6, 0)
                self.percent.append([str(self.id), round(math.log(cog)/math.log(self.COG_LOAD), 3)])
                self.id += 1

        #print("fans: ", self.id)
        start = time.time()
        connectors = self._find_connectors()
        end = time.time()
        #print('self._find_connectors took {} to complete'.format(end-start))
        for c in connectors:
            anchor = c[0]
            spanner = c[1]

            self._update_graph(spanner)
            self._format_one((str(self.id), spanner), 'connector')
            motif_vis = motif_vis.union(set(spanner))
            v = len(self.G.nodes)
            e = len(self.G.edges)
            cog = e + 2 * e / (v * (v - 1)) + max(e - 3 * v + 6, 0)
            self.percent.append([str(self.id), round(math.log(cog) / math.log(self.COG_LOAD), 3)])
            self.id += 1

            ## remove


        cliques = nx.find_cliques(self.G)
        # cliques = self._find_cliques_2()
        # print(cliques)
        filtered_clique = []
        for idx, c in enumerate(cliques):
            c = set(c).difference(motif_vis)
            # print(c)
            if len(c)<3:
                continue
            # reduced = len(c)*(len(c) - 1)
            # # print(reduced, c)
            # heapq.heappush(motifs, (-reduced, set(c), 'clique'))
            filtered_clique.append(c)
        self._remove_overlap_motifs(filtered_clique)


        dangling_nodes = [x[0] for x in self.G.adjacency() if len(x[1]) == 0 and not x[0].isdigit()]
        if len(dangling_nodes) > 2:
            self._update_graph(dangling_nodes)
            self._format_one((str(self.id), dangling_nodes), 'single')
            motif_vis = motif_vis.union(set(dangling_nodes))
            v = len(self.G.nodes)
            e = len(self.G.edges)
            cog = e + 2 * e / (v * (v - 1)) + max(e - 3 * v + 6, 0)
            self.percent.append([str(self.id), round(math.log(cog) / math.log(self.COG_LOAD), 3)])
            self.id += 1

        vis = motif_vis
        # print('all found motifs: ', [m[1] for m in motifs])
        start = time.time()
        # self._remove_duplicate_motifs(motifs)
        while len(motifs) > 0:
            # print("vis: ",vis)
            m = heapq.heappop(motifs)
            # print("motif: ",m)
            # print(self.id, len(motifs), m)
            nodes = m[1]
            # nodes = list(filter(lambda x: x.isdigit(), nodes))

            if self._is_valid(len(nodes), m[2]):
                # print('valid motif: ', m)
                self._update_graph(nodes)
                vis = vis.union(nodes)
                self._format_one((str(self.id), nodes), m[2])

                v = len(self.G.nodes)
                e = len(self.G.edges)
                cog = e+2*e/(v*(v-1))+max(e-3*v+6, 0)
                # cog_orig = self.E+2*self.E/(self.V*(self.V-1))+max(self.E-3*self.V+6, 0)
                self.percent.append([str(self.id), round(math.log(cog)/math.log(self.COG_LOAD), 3)])
                self.id += 1
            new_motifs = []
            for i in range(len(motifs)):
                # print('update motif')
                element = motifs[i]
                nodes = element[1]
                # print('update motif: ', nodes)
                no_overlap = set(nodes).difference(vis)
                # print('remove overlap: ', no_overlap)
                if self._is_valid(len(no_overlap), element[2]):
                    # print('valid new_motif: ', no_overlap)
                    if element[2] == 'fan':
                        new_element = (-len(no_overlap), no_overlap, element[2])
                    elif element[2] == 'connector':
                        new_element = (element[0]*len(no_overlap)/len(nodes), no_overlap, element[2])
                    elif element[2] == 'clique':
                        new_element = (-len(no_overlap)*(len(no_overlap)-1), no_overlap, element[2])
                    else:
                        new_element = (-len(no_overlap)*3, no_overlap, element[2])

                    heapq.heappush(new_motifs, new_element)
            motifs = new_motifs
            heapq.heapify(motifs)
            # print(motifs[:10])
            # print('\n\n\n')
        end = time.time()
        # print('eliminate overlap took {} to complete'.format(end-start))

    def _format_one(self, m, name):
        pid = m[0]
        children = m[1]
        if self.groups.get(pid) == None:
            self.groups[pid] = {
                "data": {
                    "id": pid,
                    "type": name,
                    "children": list(children),
                    "size": 0,
                },
                "group": "nodes",
                "classes": "groupIcon"
            }
        else:
            self.groups[pid]['data']['children'] = list(children)
            self.groups[pid]['data']['type'] = name


        for child in children:
            if self.groups.get(child) is not None:
                self.groups[pid]['data']['size'] += self.groups[child]['data']['size']
            else:
                self.groups[pid]['data']['size'] += 1

    def _format(self):

        nodes = {}
        elements = []
        for node in self.data['nodes']:
            nodes[node['key']] = {
                "data": {
                    "id": node['key'],
                    "size": 1,
                },
                "position": {
                    "x": self.pos[node['key']][0],
                    "y": self.pos[node['key']][1],
                },
                "group": "nodes",
                "classes":"nodeIcon"
            }


        for edge in self.data['edges']:
            elements.append({
                "data": {
                    "source": edge['source'],
                    "target": edge['target'],
                    "category": edge['attributes']['category']
                },
                "group": "edges"

            })

        return {"nodes": nodes, "groups": self.groups, "edges": elements}

    def run(self):
        num_nodes = len(self.adj)

        #print(list(self.adj.keys()))
        round = 0
        start = time.time()
        while len(self.G.nodes())>8:

            self._find_motifs(include_pathways= round == 0)
            round += 1
            self.G.remove_edges_from(nx.selfloop_edges(self.G))
            new_adj = defaultdict(list)
            _adj = [(n, nbrdict) for n, nbrdict in self.G.adjacency()]
            for grp in _adj:
                for other in grp[1]:
                    new_adj[grp[0]].append(other)
            self.adj = new_adj
            new_num = len(_adj)
            if num_nodes - new_num <= 1 and round != 1:
                break
            else:
                num_nodes = new_num
                continue
        end = time.time()

        self.G.remove_edges_from(nx.selfloop_edges(self.G))
        res = self._format()
        # percents = [i[1] for i in self.percent]
        # if len(percents) > 0:
        #     p_max = max([i[1] for i in self.percent])
        #     p_min = min([i[1] for i in self.percent])
        #
        #     for l in self.percent:
        #         l[1] = (l[1] - p_min)/(p_max - p_min) * 0.96
        res['levels'] = self.percent

        return res


def find_motif(data):

    c = MotifFinding(data, 3)

    return c.run()

def calc_posotion(G, x_scale = 1400, y_scale = 1200):
    start = time.time()
    pos = nx.spring_layout(G, k=0.9)
    x_max = max([i[0] for i in pos.values()])
    x_min = min([i[0] for i in pos.values()])
    y_max = max([i[1] for i in pos.values()])
    y_min = min([i[1] for i in pos.values()])
    for key, val in pos.items():
        x = (val[0] - x_min)/(x_max - x_min) * x_scale
        y = (val[1] - y_min) / (y_max - y_min) * y_scale
        pos[key] = [x, y]
    end = time.time()
    print('layout finish in : {}'.format(end - start))

    return pos


def simplify_graph(nodes, edges, groups_to_collapse):
    G = nx.Graph()
    for node in nodes:
        G.add_node(node)
    for edge in edges:
        G.add_edge(edge['data']['source'], edge['data']['target'], category = edge['data']['category'])

    for group in groups_to_collapse:
        parent = group[0]
        children = group[1]
        child_nodes = sorted(list(children))
        for i in child_nodes[1:]:

            G = nx.contracted_nodes(G, child_nodes[0], i)

        G = nx.relabel_nodes(G, {child_nodes[0]: parent})
    # pos = nx.planar_layout(G)

    elements = []

    for edge in G.edges:
        elements.append({
            "data": {
                "source": edge[0],
                "target": edge[1],
                "category": G.get_edge_data(edge[0], edge[1])['category']
            },
            "group": "edges"
        })
    pos = calc_posotion(G)

    for node in G.nodes():
        elements.append({
            "data": {
                "id": node,
            },
            "position": {
                "x": pos[node][0],
                "y": pos[node][1]
            },
            "group": "nodes",
            "classes": "nodeIcon" if node in nodes else "groupIcon",
        })

    # print(len(G.nodes()), len(G.edges()), ex)
    return elements





