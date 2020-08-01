import numpy as np
import json
import graphviz
import networkx as nx

def Generate(file):
    f = open('{}'.format(file), 'r')
    # flag = 0
    total_nodes = 1
    graphs = []
    for lines in f.readlines():
        dics = json.loads(lines)
        G = nx.Graph()
        for i in range(len(dics)):
            if isinstance(dics[i], dict):
                if G.has_node(dics[i]['id']+1) == False:

                    if 'value' in dics[i].keys():
                        G.add_node(dics[i]['id'] + total_nodes, name=dics[i]['type'], feature=dics[i]['value'])
                    else:
                        G.add_node(dics[i]['id'] + total_nodes, name=dics[i]['type'])

                    if 'children' in dics[i].keys():
                        curr_node = [x + total_nodes for x in dics[i]['children']]
                        G.add_nodes_from(curr_node)

                        for j in curr_node:
                            G.add_edge(dics[i]['id'] + total_nodes,j)

                else:
                    if 'value' in dics[i].keys():
                        G.node[dics[i]['id']+total_nodes]['feature'] = dics[i]['value']
                    G.node[dics[i]['id']+total_nodes]['name'] = dics[i]['type']
                    if 'children' in dics[i].keys():
                        curr_node = [x + total_nodes for x in dics[i]['children']]
                        G.add_nodes_from(curr_node)
                        for j in curr_node:
                            G.add_edge(dics[i]['id'] + total_nodes, j)
        graphs.append((G))
        # print(G.nodes(data=True))
    return graphs

def Visualize(graph, num, file):
    dot = graphviz.Graph(comment='Result')
    for i in range(num):
        node_list = graph[i].node
        edge_list = graph[i].edges
        for j in node_list:
            node_type = graph[i].node[j]['name']
            if 'feature' in graph[i].node[j].keys():
                node_value = graph[i].node[j]['feature']
                node = node_type + ': [' + node_value + ']'
                print(node)
                dot.node(str(j), node)
            else:
                node = node_type
                dot.node(str(j), node)
        for a in edge_list:
            m, n = a[0], a[1]
            dot.edge(str(m), str(n))
        dot.render("process/test-output/%s.gv" % (file), view=True)

if __name__ == '__main__':
    graph = Generate('test.json')
    Visualize(graph,1,'test.json')