function bt(id,after)
{
eval(id+'.filters.blendTrans.stop();');
eval(id+'.filters.blendTrans.Apply();');
eval(id+'.src="'+after+'";');
eval(id+'.filters.blendTrans.Play();');
}

function m_stop(n) {
	n.stop();
}

function m_start(n) {
	n.start();
}

function goSearch(formObj) {
	if (squeeze(formObj.keyword.value)<2) {
		alert("2���� �̻� �Է��� �ֽʽÿ�.");
		formObj.keyword.focus();
		return false;
	}
    if (formObj.bbs.value=='memo') {
        formObj.act.value="MEMORECENT";
    } else if (formObj.bbs.value=='site') {
        formObj.act.value="SITESEARCH";
    } else {
        formObj.act.value="LIST";
    }
}

// ���ڿ� ���� ���� ���� �� ���� ��ȯ
function squeeze(str) {
    str = str.replace(/ /g, "");
    return str.length;
}

/* @author kenu@okjsp.pe.kr
*  @date 2003-04-07 12:47����
*  @contact http://okjsp.pe.kr
*/
/*
 ����޴��� ������ �� ������ ����ϴ� �Լ�
*/
function toggleMenu(currMenu) {
	if (document.all) {
        thisMenu = eval("document.all." + currMenu + ".style")
    } else {
		thisMenu = document.getElementById(currMenu).style
    }
	thisMenu.display = (thisMenu.display == "block")
						? "none"
						: "block";
    setCookie(currMenu, thisMenu.display, 30);
	return false
}

/*
 ��Ű ���� ���� ����޴��� ���̴� �Լ�
*/
function setMenuDefault(currMenu) {
    if (document.all) {
        thisMenu = eval("document.all." + currMenu)
    } else {
        thisMenu = document.getElementById(currMenu)
    }
    var state = getCookie(currMenu);
    if (thisMenu && state != null) {
        thisMenu.style.display = state;
        setCookie(currMenu, thisMenu.style.display, 30);
    }
    return false
}

var oldMenu = null;
/*
 ����޴��� ���̴� �Լ�
*/
function showMenu(currMenu) {
	if (document.all) {
        thisMenu = eval("document.all." + currMenu + ".style")
    } else {
		thisMenu = document.getElementById(currMenu).style
    }
    if (oldMenu != null) {
        oldMenu.display = "none";
    }
	thisMenu.display = "block"; // show
	oldMenu = thisMenu;
	return false;
}

// �����̹��� ǥ��
function errImage(n) {
    n.src = "/images/bnr_okjsp.gif";
}

/* @author kenu@okjsp.pe.kr
*  @date 2003-01-07 4:58����
*  @contact http://okjsp.pe.kr
*/
/*
 ���¿� ���� ��ʸ� �����ش�.
 0: �Ϲ� �̹���, 1: �÷��ù��
 ����
    <script>
    for(var i=0;i<banner.length;i++) {
        showBanner(banner[i]);
        if(i%2==1) document.write("<br/>");
    }
    </script>
 �����ʹ� bannerData.js �� �迭�� ����
*/
var item;
var bannerContent='';
function showBanner(n) {
    item = n.split(",,");
    switch (item[0]) {
        case "0":
            var altText = item[5];
            if(!altText)  altText = item[2];
            bannerContent+=("<a href='"+item[2]+"' target=_blank title='"+altText+"'>");
            bannerContent+=("<img src='"+item[1]+"' border=0 width="+item[3]+", height="+item[4] );
            bannerContent+=(" onerror='errImage(this)' style='margin:1'></a>");
        break;
        case "1":
            bannerContent+=('<object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" codebase="http://download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=6,0,29,0" width="'+item[3]+'" height="'+item[4]+'">');
            bannerContent+=('<param name="movie" value="'+item[1]+'"><param name="quality" value="high">');
            bannerContent+=('<embed src="'+item[1]+'" quality="high" pluginspage="http://www.macromedia.com/go/getflashplayer" type="application/x-shockwave-flash" width="'+item[3]+'" height="'+item[4]+'" style="margin:1"></embed></object>');
        break;
        default:
        break;
    }
}

// �ؽ�Ʈ ���
function showTextBanner(n) {
    item = n.split(",,");
    bannerContent+=("<a href='"+item[2]+"' target=_blank class='banner'>");
    bannerContent+=(item[2].substring(7)+"</a><br>");
}

function makeBannerContent(n, col) {
    if ( n == banner2 ) {
        changeModeButton();
    }
    for(var i=0;i<n.length;i++) {
        if (col>0) {
            showBanner(n[i]);
            if(i%col==(col-1)) bannerContent+=("<br/>");
        } else {
            showTextBanner(n[i]);
        }
    }
}

// ��� ǥ���ϱ�
function displayBanner(n, col) {
    this.col = col;
    box = n;
    makeBannerContent(n, col);
    document.write(bannerContent);
    bannerContent='';
}

// ��� �ٲٱ�
function changeModeButton() {
    bannerContent+=("<div onClick='changeMode()' style='cursor:hand'><font color='white'>"+
        "<font color='red'>��</font> <b>Click to Change</b></font></div>");
}
// ��� �ٲٱ�
function changeMode() {
    col = 2-col;
    makeBannerContent(box, col);
    document.getElementById('banner2').innerHTML=bannerContent;
    bannerContent = '';
}

// ��ʼ��� �⺻ 1��
function bannerShuffle(n, count){
    bannerShuffle(n, count, 1);
}

// ��ʼ���
var box;
var col;
function bannerShuffle(n, count, col){
    // ��� �ڼ��, box �迭�� �ֱ�
    this.col = col;
    box = new Array();
    var idx = 0;
    var len = n.length;
    // ��ʵ����ͺ��� ǥ�ð����� ���� ��� �ִ밪���� ����
    if(count>len) count=len;
    // ��� �ڼ���
    for(var i=0; i<count; i++) {
        idx = Math.floor(Math.random()*(len-i));
        box[i] = n[idx];
        for(var j=idx; j<len-1-i; j++){
            n[j] = n[j+1];
        }
    }
    displayBanner(box, col);
    document.write(bannerContent);
    bannerContent='';
}


// ��Ű ���
function setCookie( name, value, expiredays )
{
 var todayDate = new Date();
 todayDate.setDate( todayDate.getDate() + expiredays );
 document.cookie = name + "=" + escape( value ) + "; path=/; expires=" + todayDate.toGMTString() + ";"
}

// ��Ű ����
function getCookie(sName)
{
  var aCookie = document.cookie.split("; ");
  for (var i=0; i < aCookie.length; i++)
  {
    var aCrumb = aCookie[i].split("=");
    if (sName == aCrumb[0])
      return unescape(aCrumb[1]);
  }
  return null;
}

/**
 * ��Ų ����
 */
function setSkin(skinType) {
	setCookie('skin', skinType, 100);
	document.location.reload();
}
