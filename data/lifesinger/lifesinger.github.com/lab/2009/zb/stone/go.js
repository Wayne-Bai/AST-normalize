<!--
//��¥���ﲷ���Ƴ���

function go()
{
var year  = document.Info.year1.value * 1 + document.Info.year2.value * 1 + document.Info.year3.value * 1;
var month = document.Info.month.value;
var day   = document.Info.day.value;
var blood = document.Info.blood.value;
var sex   = document.Info.sex.value;
var range = document.Info.range.value;

//����������Ѫ����n
year  = year % 5;
month = month % 6;
day = day * 9;
for(;day>9;) day = day - 10;

var n = blood * 108 + year * 100 + month * 10 + day * 1;
for(;n>456;)  n = n - 456;
if(n==0)  n = 456; 

var n1 = n;


//�Ա��ж�
if(sex==1){ 
	while(SexType[n]==0)  {
		n = n + 1;
                for(;n>456;)  n = n - 456;
         }
 }

if(sex==0){ 
	while(SexType[n]==1)  {
		n = n + 1;
                for(;n>456;)  n = n - 456;
         }
 }

var n2 = n;

//���ﷶΧ
if(range!=1){ 
if(range==2){ 
	while(MainRole[n]==0||SexType[n]!=sex)  {
		n = n + 1;
                for(;n>456;)  n = n - 456;}
         }
if(range==3){ 
 	while(GoldRole[n]==0)  {
		n = n + 1;
                for(;n>456;)  n = n - 456;}
         }
}

var n3 = n;

//���
//var t3 = n1 + "\t�Ա�" + sex + "\t:" + n2 + "\t���ﷶΧ" + range +"\t:" + n3;
//alert(n);
var t2 ="<br>���ں�¥���ǣ�<strong>" + Name[n] + "</strong>";
t2 = t2 + "<br><br>" + Prol[n];
document.all.show.innerHTML = t2;
}

var DefaultHtml = "";
document.all.show.innerHTML = DefaultHtml;

function ResetAll()
{
document.Info.reset();
document.all.show.innerHTML = DefaultHtml;
}
//-->
