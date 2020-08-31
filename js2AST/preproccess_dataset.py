import os

path = 'dataset-poc'
files = os.listdir(path)
for file in files:
    if '.' not in file:
        f = os.listdir(path+'/'+file)
        # for js_f in f:
        #     if '.' not in js_f:
        #         js_file = os.listdir(path + '/' + file + '/' + js_f)
        for js in f:
            # f = open(path + '/' + file + '/' + js_f + '/' + js, 'r')
            # print(path + '/' + file + '/' + js_f + '/' + js)
            f = open(path + '/' + file + '/' + js, 'r')
            print(path + '/' + file  + '/' + js)

            line_list = []

            for line in f.readlines():
                line = line.strip('\n')
                line_list.append(line)

            num_list = []
            for i in range(len(line_list)):
                if '```' in line_list[i]:
                    num_list.append(i)
            js = js.strip('.md')
            w = open('dataset-poc-pro' + '/' + file + '/' + js + '.js', 'a')
            for i in range(num_list[0] + 1, num_list[1]):
                w.write(line_list[i])
                w.write('\n')
            w.close()