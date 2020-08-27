import esprima
import json


def extractAST(dic, flag):
    global new_curr, new_curr_list
    new_dic = {}
    value_type = []

    for value in dic.values():
        value_type.append(type(value))
    # print(value_type)
    if list in value_type or dict in value_type:
        for key, value in dic.items():
            if key == 'type':
                new_dic['id'] = flag
                new_dic['type'] = value
                flag += 1
            if key == 'name' or key == 'value':
                new_dic['value'] = value
            if type(value) == list:
                children = []
                for i in range(len(value)):
                    new_curr_dic, new_curr_list, flag = extractAST(value[i], flag)
                    for dics in new_curr_list:
                        if dics not in new_curr_dic:
                            for k,v in dics.items():
                                if k == 'id':
                                    children.append(v)
                    new_dic['children'] = children
                    new_curr = new_curr_list
                    new_curr_list.append(new_dic)

            elif type(value) == dict:
                children = []
                new_curr_dic, new_curr_list, flag = extractAST(value, flag)
                for dics in new_curr_list:
                    if dics not in new_curr_dic:
                        for k, v in dics.items():
                            if k == 'id':
                                children.append(v)
                new_dic['children'] = children
                new_curr = new_curr_list
                new_curr_list.append(new_dic)
        return new_curr, new_curr_list, flag
    else:
        new_list = []
        for key,value in dic.items():
            if key == 'type':
                new_dic['id'] = flag
                new_dic['type'] = value
                flag += 1
            if key == 'name' or key == 'value':
                new_dic['value'] = value
            new_list.append(new_dic)
            print(new_list)


        return [], new_list, flag

if __name__ == '__main__':
    # print(esprima)

    # tree = esprima.tokenize('console.log("helloworld")', range=True)

    # print(json.dumps(tree.to_dict()))
    # print(tree)

    tree = esprima.parseScript('console.log("helloworld")')
    # print(json.dumps(tree.toDict()))
    tree_dic = tree.toDict()
    print(tree)
    # print(tree.toDict())
    #
    # ast_dic = []
    # flag = 0
    # new_dic = {}
    # dic, final_list, flag = extractAST(tree_dic, flag)
    # print(final_list)
    # for key,value in tree_dic.items():
    #     if key == 'type':
    #         curr_dic = {}