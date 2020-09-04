import json

f = open('AST-UAF.json', 'r')
w = open('NodeLabel-UAF.txt', 'a')

node_label = []
for line in f.readlines():
    graphs_list = json.loads(line)
    for dic in graphs_list:
        if dic['type'] not in node_label:
            node_label.append(dic['type'])

print(len(node_label))
print(node_label)

for i in range(len(node_label)):
    w.write(node_label[i] + ' ' + str(i+1))
    w.write('\n')

f.close()
w.close()