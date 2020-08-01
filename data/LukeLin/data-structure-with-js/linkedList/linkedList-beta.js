// 单链表
/*
 线性链表存储结构
 整个链表的存取必须从头指针开始进行，头指针指示链表中第一个结点（即第一个数据元素的存储映像）的存储位置。
 同时，由于最后一个数据元素没有直接后继，则线性链表中最后一个结点的指针为空null。
 */

function LNode(data, node) {
    this.data = data;
    this.next = node || null;
}
LNode.prototype = {
    constructor: LNode,
    // 时间复杂度O(n)
    getElem: function getElem(i) {
        // 初始化，p指向第一个节点，j为计数器
        var p = this.next;
        var j = 1;
        // 顺指针向后查找，知道p指向第i个元素或p为空
        while (p && j < i) {
            p = p.next;
            ++j;
        }
        // 第i个元素不存在
        // 或者取第i个元素
        return (!p || j > i) ? null : p.data;
    },
    // 时间复杂度O(n)
    listInsert: function listInsert(i, data) {
        var j = 0;
        var p = this;
        // 寻找第i-1个节点
        while (p && j < i - 1) {
            p = p.next;
            ++j;
        }
        // i < 1或者大于表长+1
        if (!p || j > i - 1) return false;
        // 生成新节点，插入p节点后面
        p.next = new LNode(data, p.next);
        return true;
    },
    listDelete: function listDelete(i) {
        var j = 0;
        var p = this;

        while (p.next && j < i - 1) {
            p = p.next;
            ++j;
        }

        if (!p.next || j > i - 1) return false;
        var q = p.next;
        p.next = q.next;
        return q.data;
    },

    listConcat: function(bList){
        var hc = this;
        var p = this;

        while(p.next) p = p.next;

        p.next = bList;

        return hc;
    }
};

LNode.createList_L = function createList_L(n) {
    var deferred = require('D:\\node\\node_modules\\rsvp').defer();
    var l = new LNode();
    var count = n;
    process.stdin.setEncoding('utf8');

    process.stdin.on('data', function handler(data) {
        console.log(123);
        data = data.replace('\n', '');
        l.next = new LNode(data, l.next);
        if (!(--count)) {
            console.log('pausing');
            process.stdin.pause();
            deferred.resolve(l);
        }
    });

    return deferred.promise;
};

function deepCopy(obj) {
    var newObj = {};

    for (var i in obj) {
        if (typeof obj[i] === 'object') {
            newObj[i] = deepCopy(obj[i]);
        } else {
            newObj[i] = obj[i];
        }
    }

    return newObj;
}


/*
 已知单链线性表a和b的元素按值非递减排列。
 归并a和b得到新的单链线性表c，c的元素也按值非递减排列。
 */
LNode.mergeList = function mergeList(a, b) {
    var pa = a.next;
    var pb = b.next;
    // 用a的头结点作为c的头结点
    var c = a;
    var pc = a;

    while (pa && pb) {
        if (pa.data <= pb.data) {
            pc.next = pa;
            pc = pa;
            pa = pa.next;
        } else {
            pc.next = pb;
            pc = pb;
            pb = pb.next;
        }
    }

    // 插入剩余段
    pc.next = pa ? pa : pb;

    return c;
};

function log(list) {
    var arr = [];

    do {
        arr.push(list.data);
        list = list.next;
    } while (list);

    console.log(arr.join(','));
}


void function test() {
    var a1 = new LNode(1);
    a1.listInsert(1, 2);
    a1.listInsert(2, 3);
    a1.listInsert(1, 4);
    console.log(a1.getElem(1));
    console.log(a1);
    log(a1);
    a1.listDelete(1);
    console.log('a1 linkList:');
    console.log(a1);
    log(a1);
    /*
     LNode.createList_L(5)
     .then(function(list){
     console.log(list);
     });
     */
    var a2 = new LNode(3);
    a2.listInsert(1, 3);
    a2.listInsert(2, 8);
    a2.listInsert(1, 4);
    a2.listDelete(2);
    console.log('a2 linkList');
    log(a2);

    var a3 = LNode.mergeList(a2, a1);
    console.log('merging linkLists');
    console.log(a3);
    log(a3);
}();