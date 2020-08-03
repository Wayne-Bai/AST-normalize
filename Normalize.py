import numpy as np
import json
import graphviz
import networkx as nx

def Generate(dics):
    total_nodes = 1
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
        # print(G.nodes(data=True))
    return G

def Visualize(graph, file):
    # dot = graphviz.Graph(comment='Result', format='png')
    dot = graphviz.Graph(comment='Result', format='pdf')
    node_list = graph.node
    edge_list = graph.edges
    for i in node_list:
        node_type = graph.node[i]['name']
        if 'feature' in graph.node[i].keys():
            node_value = graph.node[i]['feature']
            node = node_type + ': [' + node_value + ']'
            print(node)
            dot.node(str(i), node)
        else:
            node = node_type
            dot.node(str(i), node)
    for a in edge_list:
        m, n = a[0], a[1]
        dot.edge(str(m), str(n))
    dot.render("process/test-output/%s.gv" % ('normalize'), view=True)

def Normalize(graph, dics):
    var_flag = 0
    func_flag = 0
    # print(graph.nodes(data=True))
    for i in range(len(dics)):
        if isinstance(dics[i], dict):

            # VariableDeclarator (v)
            if dics[i]['type'] == 'VariableDeclarator':
                node_adj = graph.adj[dics[i]['id']+1]
                for k in node_adj.keys():
                    if dics[k-1]['type'] == 'VariableDeclaration':
                        curr = dics[i]['value']
                        dics[i]['value'] = 'v' + str(var_flag)
                        for j in range(i, len(dics)):
                            if isinstance(dics[j], dict):
                                if 'value' in dics[j].keys() and dics[j]['value'] == curr:
                                    dics[j]['value'] = 'v' + str(var_flag)
                        var_flag += 1

            if dics[i]['type'] == 'Identifier':
                if dics[i]['value'] != graph.nodes[dics[i]['id']+1]['feature']:
                    node_adj = graph.adj[dics[i]['id']+1]
                    for k in node_adj.keys():
            # FunctionDeclaration (f)
                        if dics[k-1]['type'] == 'FunctionDeclaration':
                            curr = dics[i]['value']
                            dics[i]['value'] = 'f' + str(func_flag)
                            for j in range(i, len(dics)):
                                if isinstance(dics[j], dict):
                                    if 'value' in dics[j].keys() and dics[j]['value'] == curr:
                                        dics[j]['value'] = 'f' + str(func_flag)
                            func_flag +=1
            # CallExpression (f)
                        if dics[k-1]['type'] == 'CallExpression':
                            if graph.nodes

    # print(dics)
    return dics
if __name__ == '__main__':
    file = 'test.json'
    f = open(file, 'r')
    for lines in f.readlines():
        dics = json.loads(lines)
        graph = Generate(dics)
        # Visualize(graph,file)
        normalize_dic = Normalize(graph,dics)
        normalize_graph = Generate(normalize_dic)
        Visualize(normalize_graph,file)