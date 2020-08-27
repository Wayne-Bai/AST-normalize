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

def Visualize(graph, file,Original=True):
    # dot = graphviz.Graph(comment='Result', format='png')
    dot = graphviz.Graph(comment='Result', format='pdf')
    node_list = graph.node
    edge_list = graph.edges
    for i in node_list:
        node_type = graph.node[i]['name']
        if 'feature' in graph.node[i].keys():
            node_value = graph.node[i]['feature']
            node = str(node_type) + ': [' + str(node_value) + ']'
            print(node)
            dot.node(str(i), node)
        else:
            node = node_type
            dot.node(str(i), node)
    for a in edge_list:
        m, n = a[0], a[1]
        dot.edge(str(m), str(n))
    if Original:
        dot.render("process/original/%s.gv" % (file), view=True)
    else:
        dot.render("process/normalize/%s.gv" % (file), view=True)

def Normalize(graph, dics, property):
    var_flag = 0
    func_flag = 0
    str_flag = 0
    # print(graph.nodes(data=True))
    for i in range(len(dics)):
        if isinstance(dics[i], dict):

            # VariableDeclarator (v)/(f)
            if dics[i]['type'] == 'VariableDeclarator':
                if 'value' in dics[i].keys() and dics[i]['value'] == graph.nodes[dics[i]['id'] + 1]['feature']:
                    node_adj = graph.adj[dics[i]['id']+1]
                    VD_list = []
                    for k in node_adj.keys():
                        VD_list.append(k)
                    if len(VD_list) == 2 and dics[VD_list[1]-1]['type'] == 'FunctionExpression':
                        curr = dics[i]['value']
                        dics[i]['value'] = 'f' + str(func_flag)
                        for j in range(len(dics)):
                            if isinstance(dics[j], dict):
                                if 'value' in dics[j].keys() and dics[j]['value'] == curr:
                                    dics[j]['value'] = 'f' + str(func_flag)
                        func_flag += 1
                    else:
                        curr = dics[i]['value']
                        dics[i]['value'] = 'v' + str(var_flag)
                        for j in range(len(dics)):
                            if isinstance(dics[j], dict):
                                if 'value' in dics[j].keys() and dics[j]['value'] == curr:
                                    dics[j]['value'] = 'v' + str(var_flag)
                        var_flag += 1

            # Identifier (v)/(f) depneds on the node type before it
            if dics[i]['type'] == 'Identifier':
                if dics[i]['value'] == graph.nodes[dics[i]['id']+1]['feature'] and dics[i]['value'] not in property and type(dics[i]['value']) != int and type(dics[i]['value']) != float:
                    node_adj = graph.adj[dics[i]['id']+1]
                    for k in node_adj.keys():

            # Identifier <- FunctionDeclaration (f)/(v)
                        if dics[k-1]['type'] == 'FunctionDeclaration':
                            node = graph.adj[dics[k-1]['id']+1]
                            curr = dics[i]['value']
                            FD_list = []
                            for key_FD in node.keys():
                                FD_list.append((key_FD))
                            if 'f' not in dics[FD_list[1] - 1]['value']:
                                dics[i]['value'] = 'f' + str(func_flag)
                                for j in range(len(dics)):
                                    if isinstance(dics[j], dict):
                                        if 'value' in dics[j].keys() and dics[j]['value'] == curr:
                                            dics[j]['value'] = 'f' + str(func_flag)
                                func_flag +=1
                            else:
                                dics[i]['value'] = 'v' + str(var_flag)
                                for j in range(len(dics)):
                                    if isinstance(dics[j], dict):
                                        if 'value' in dics[j].keys() and dics[j]['value'] == curr:
                                            dics[j]['value'] = 'v' + str(var_flag)
                                var_flag += 1



            # Identifier <- AssignmentEpression & ForInStatement & SequenceExpression & Property & NewExpression(v)
                        if dics[k-1]['type'] == 'AssignmentExpression' or dics[k-1]['type'] == 'ForInStatement'\
                                or dics[k-1]['type'] == 'SequenceExpression' or dics[k-1]['type'] == 'SwitchCase'\
                                or dics[k-1]['type'] == 'CatchClause' or dics[k-1]['type'] == 'AssignmentPattern'\
                                or dics[k-1]['type'] == 'Property' or dics[k-1]['type'] == 'NewExpression':
                            curr = dics[i]['value']
                            dics[i]['value'] = 'v' + str(var_flag)
                            for j in range(len(dics)):
                                if isinstance(dics[j], dict):
                                    if 'value' in dics[j].keys() and dics[j]['value'] == curr:
                                        dics[j]['value'] = 'v' + str(var_flag)
                            var_flag += 1

            # Identifier <- CallExpression (f)
                        if dics[k-1]['type'] == 'CallExpression':
                            curr_children = dics[k-1]['children']

                            # Only one child
                            if len(curr_children) == 1 and curr_children[0] == i:
                                curr = dics[i]['value']
                                dics[i]['value'] = 'f' + str(func_flag)
                                for j in range(len(dics)):
                                    if isinstance(dics[j], dict):
                                        if 'value' in dics[j].keys() and dics[j]['value'] == curr:
                                            dics[j]['value'] = 'f' + str(func_flag)
                                func_flag += 1

                            # more than two children
                            elif len(curr_children) >= 2:
                                child_type_list = []
                                child_value_list = []
                                for child in curr_children:
                                    child_type_list.append(dics[child]['type'])
                                    if 'value' in dics[child].keys():
                                        child_value_list.append(dics[child]['value'])
                                child_type_list.remove(dics[i]['type'])
                                # print(child_type_list)
                                child_value_list.remove(dics[i]['value'])
                                # print(child_value_list)
                                symbol = 0
                                for value in child_value_list:
                                    if 'f' in value:
                                        symbol = 1
                                if symbol == 1:
                                    curr = dics[i]['value']
                                    dics[i]['value'] = 'v' + str(var_flag)
                                    for j in range(len(dics)):
                                        if isinstance(dics[j], dict):
                                            if 'value' in dics[j].keys() and dics[j]['value'] == curr:
                                                dics[j]['value'] = 'v' + str(var_flag)
                                    var_flag += 1
                                elif symbol == 0 and len(set(child_type_list)) == 1:
                                    curr = dics[i]['value']
                                    dics[i]['value'] = 'f' + str(func_flag)
                                    for j in range(len(dics)):
                                        if isinstance(dics[j], dict):
                                            if 'value' in dics[j].keys() and dics[j]['value'] == curr:
                                                dics[j]['value'] = 'f' + str(func_flag)
                                    func_flag += 1
                                elif symbol == 0 and len(set(child_type_list)) == 2 and 'Property' in set(child_type_list)\
                                        and 'Identifier' in set(child_value_list):
                                    curr = dics[i]['value']
                                    dics[i]['value'] = 'f' + str(func_flag)
                                    for j in range(len(dics)):
                                        if isinstance(dics[j], dict):
                                            if 'value' in dics[j].keys() and dics[j]['value'] == curr:
                                                dics[j]['value'] = 'f' + str(func_flag)
                                    func_flag += 1
                                elif symbol == 0 and len(set(child_type_list)) > 1:
                                    curr = dics[i]['value']
                                    dics[i]['value'] = 'v' + str(var_flag)
                                    for j in range(len(dics)):
                                        if isinstance(dics[j], dict):
                                            if 'value' in dics[j].keys() and dics[j]['value'] == curr:
                                                dics[j]['value'] = 'v' + str(var_flag)
                                    var_flag += 1

            # Identifier <- FunctionExpression & MemberExpression & UnaryExpression & BinaryExpression & LogicalExpression
            #               & ExpressionStatement(f)/(v)
                        if dics[k-1]['type'] == 'FunctionExpression' or dics[k-1]['type'] == 'MemberExpression'\
                                or dics[k-1]['type'] == 'UnaryExpression' or dics[k-1]['type'] == 'BinaryExpression'\
                                or dics[k-1]['type'] == 'LogicalExpression' or dics[k-1]['type'] == 'ExpressionStatement':
                            curr = dics[i]['value']
                            for j in range(len(dics)):
                                if isinstance(dics[j], dict):
                                    if 'value' in dics[j].keys() and dics[j]['value'] == curr and dics[j]['type'] == 'Identifier':
                                        curr_node = graph.adj[dics[j]['id'] + 1]
                                        for key in curr_node.keys():
                                            if dics[key-1]['type'] == 'CallExpression':
                                                curr_list = dics[key-1]['children']
                                                curr_type_list = [dics[n]['type'] for n in curr_list]
                                                if 'MemberExpression' in curr_type_list:
                                                    dics[i]['value'] = 'v' + str(var_flag)
                                                    for h in range(len(dics)):
                                                        if isinstance(dics[h], dict):
                                                            if 'value' in dics[h].keys() and dics[h]['value'] == curr:
                                                                dics[h]['value'] = 'v' + str(var_flag)
                                                    var_flag += 1
                                                else:
                                                    for node in curr_list:
                                                        if node != j and 'value' in dics[node].keys() and 'f' in dics[node]['value']:
                                                            dics[i]['value'] = 'v' + str(var_flag)
                                                            for h in range(len(dics)):
                                                                if isinstance(dics[h], dict):
                                                                    if 'value' in dics[h].keys() and dics[h]['value'] == curr:
                                                                        dics[h]['value'] = 'v' + str(var_flag)
                                                            var_flag += 1
                                                        elif node != j and 'value' in dics[node].keys() and 'f' not in dics[node]['value']:
                                                            dics[i]['value'] = 'f' + str(func_flag)
                                                            for h in range(len(dics)):
                                                                if isinstance(dics[h], dict):
                                                                    if 'value' in dics[h].keys() and dics[h]['value'] == curr:
                                                                        dics[h]['value'] = 'f' + str(func_flag)
                                                            func_flag += 1
                            if dics[i]['value'] == curr:
                                dics[i]['value'] = 'v' + str(var_flag)
                                for j in range(len(dics)):
                                    if isinstance(dics[j], dict):
                                        if 'value' in dics[j].keys() and dics[j]['value'] == curr:
                                            dics[j]['value'] = 'v' + str(var_flag)
                                var_flag += 1

            # Property (v)/build-in: depneds on whether it is build-in property or not
            if dics[i]['type'] == 'Property':
                # print('************************')
                # if 'value' in dics[i].keys():
                #     print('-------------------------')
                #     print(dics[i]['value'])
                #     print(type(dics[i]['value']))
                if 'value' in dics[i].keys() and dics[i]['value'] == graph.nodes[dics[i]['id'] + 1]['feature'] \
                        and dics[i]['value'] not in property and type(dics[i]['value']) != int and type(dics[i]['value']) != float:
                    curr = dics[i]['value']
                    dics[i]['value'] = 'v' + str(var_flag)
                    for j in range(len(dics)):
                        if isinstance(dics[j], dict):
                            if 'value' in dics[j].keys() and dics[j]['type'] != 'LiteralNumber'and dics[j]['value'] == curr:
                                dics[j]['value'] = 'v' + str(var_flag)
                    var_flag += 1

            # Normalize LiteralString as 's'
            if dics[i]['type'] == 'LiteralString':
                if dics[i]['value'] == graph.nodes[dics[i]['id'] + 1]['feature'] and dics[i]['value'] != 'use strict':
                    curr = dics[i]['value']
                    dics[i]['value'] = 's' + str(str_flag)
                    for j in range(len(dics)):
                        if isinstance(dics[j], dict):
                            if 'value' in dics[j].keys() and dics[j]['value'] == curr:
                                dics[j]['value'] = 's' + str(str_flag)
                    str_flag += 1
    return dics


if __name__ == '__main__':
    file = 'test/check1.json'
    f1 = open(file, 'r')
    f2 = open('properties.txt', 'r')
    w = open('test/deduplicate_50graphs-normalize.json', 'a')

    property = []
    flag = 1
    for line in f2.readlines():
        line = line.strip('\n')
        if line not in property:
            property.append(line)

    for lines in f1.readlines():
        dics = json.loads(lines)
        graph = Generate(dics)
        file_name = file + '-' + str(flag)
        Visualize(graph,file_name)
        # normalize_dic = Normalize(graph,dics,property)
        # w2j = json.dumps(normalize_dic)
        # w.write(w2j)
        # w.write('\n')
        # normalize_graph = Generate(normalize_dic)
        # Visualize(normalize_graph,file_name,Original=False)
        flag += 1