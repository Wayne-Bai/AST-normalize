import esprima
# import js2py
import os
import json

def extractAST(dic, dic_list, flag):
    new_dic = {}
    new_key_list = []
    new_value_list = []

    if type(dic) == dict:

        for key,value in dic.items():
            new_key_list.append(key)
            if type(value) == list or type(value) == dict:
                new_value_list.append(value)
        # print(new_list)

    if new_value_list != []:

        for key, value in dic.items():
            if key == 'type':
                new_dic['id'] = flag
                new_dic['type'] = value
                flag += 1
            if key == 'raw' or key == 'name':
                new_dic['value'] = value

        children = []

        for child in new_value_list:
            if type(child) == dict:
                if 'type' in child.keys():
                    child_dic, dic_list, flag = extractAST(child, dic_list, flag)
                    children.append(child_dic['id'])
            if type(child) == list:
                for i in range(len(child)):
                    if type(child[i]) == dict and 'type' in child[i].keys():
                        child_dic, dic_list, flag = extractAST(child[i], dic_list, flag)
                        children.append(child_dic['id'])
        new_dic['children'] = children
        dic_list.append(new_dic)

        return new_dic, dic_list, flag

    else:
        key_list = []
        for key in dic.keys():
            key_list.append(key)
        print(key_list)
        for key,value in dic.items():
            if key == 'type':
                new_dic['id'] = flag
                new_dic['type'] = value
                flag += 1
            if key == 'raw' or key == 'name':
                new_dic['value'] = value
        dic_list.append(new_dic)
        return new_dic, dic_list, flag






if __name__ == '__main__':
    w1 = open('AST-TC-address.txt', 'a')
    w2 = open('problem-AST-TC.txt', 'a')
    path = 'dataset-type/TC'
    files = os.listdir(path)
    for file in files:
        # code for dataset-poc-pro
        # if '.' not in file:
        #     f = os.listdir(path+'/'+file)
        #     # for js_f in f:
        #     #     if '.' not in js_f:
        #     #         js_file = os.listdir(path + '/' + file + '/' + js_f)
        #     for js in f:
        #         # f = open(path + '/' + file + '/' + js_f + '/' + js, 'r')
        #         # print(path + '/' + file + '/' + js_f + '/' + js)
        #         f = open(path + '/' + file + '/' + js, 'r')
        #         print(path + '/' + file  + '/' + js)
        #         src = f.read()

        f = open(path+'/'+file)
        src = f.read()

    # path = 'dataset/2016'
    # files = os.listdir(path)
    # for file in files:
    #     if '.' not in file:
    #         js_f = os.listdir(path + '/' + file)
    #         for js in js_f:
    #             f = open(path + '/' + file + '/' + js, 'r')
    #             print(path + '/' + file + '/' + js)
    #             code_str = ''
    #             for line in f.readlines():
    #                 code_str += str(line)

    # f = open('test4.js', 'r')
    # code_str = ''
    # for line in f.readlines():
    #     code_str += str(line)

                # # print(code_str)
                # esprima = js2py.require('esprima')

                # # w1.write(path + '/' + file + '/' + js_f + '/' + js)
                # tree = esprima.parseScript(code_str)
                # tree_dic = tree.toDict()
                # print(tree_dic)
                # # print(tree)
                # ast_dic = []
                # flag = 0
                # dic, final_list, flag = extractAST(tree_dic, ast_dic, flag)
                # AST_list = sorted(final_list, key=lambda e: e.__getitem__('id'), reverse=False)
                # print(tree)
                # f1 = open('AST-POC.json', 'a')
                # print(AST_list)
                # AST_list_json = json.dumps(AST_list)
                #
                # w1.write(path + '/' + file + '/' + js)
                # w1.write('\n')
                #
                # f1.write(AST_list_json)
                # f1.write('\n')
                # f.close()
                # f1.close()
                # print(AST_list_json)
                # print(type(AST_list_json))



        try:
            # w1.write(path + '/' + file + '/' + js_f + '/' + js)
            tree = esprima.parseScript(src)
            tree_dic = tree.toDict()
            print(tree_dic)
            # print(tree)
            ast_dic = []
            flag = 0
            dic, final_list, flag = extractAST(tree_dic, ast_dic, flag)
            AST_list = sorted(final_list, key=lambda e: e.__getitem__('id'), reverse=False)
            print(tree)
            f1 = open('AST-TC.json', 'a')
            print(AST_list)
            AST_list_json = json.dumps(AST_list)

            # code for dataset-poc-pro
            # w1.write(path + '/' + file + '/' + js)
            w1.write(path+'/'+file)
            w1.write('\n')

            f1.write(AST_list_json)
            f1.write('\n')
            f.close()
            f1.close()
            print(AST_list_json)
            print(type(AST_list_json))
        except Exception:
            w2.write(path + '/' + file)
            w2.write('\n')

    w1.close()
    w2.close()