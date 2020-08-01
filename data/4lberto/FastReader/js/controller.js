function TodoCtrl($scope, $timeout, $sce) {


  var textoSplit;
  $scope.palabraActual=$sce.trustAsHtml("&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;a-word");
  $scope.indicePalabra=0;
  $scope.textoArea = "There is something at the bottom of every new human thought, every thought of genius, or even every earnest thought that springs up in any brain, which can never be communicated to others, even if one were to write volumes about it and were explaining one's idea for thirty-five years; there's something left which cannot be induced to emerge from your brain, and remains with you forever; and with it you will die, without communicating to anyone perhaps the most important of your ideas. - Fyodor Dostoyevsky, The Idiot"
  $scope.speed = 100;
  $scope.speedFactor = 10;
  $scope.leyendo = false;
  $scope.speedBase = 20;


  $scope.resetData = function()
  {
    $scope.indicePalabra=0;
    textoSplit = $scope.textoArea.split(" "); 
  }

  
  $scope.startReading = function()
  {
    $scope.leyendo = true;
    
    if(!((textoSplit)&&(textoSplit.length>0)))
    {
      $scope.resetData();

    }
    
    loop();

  }

  $scope.stopReading = function()
  {
    $scope.leyendo = false;
  }


  $scope.reset = function()
  {
    $scope.leyendo = false;
    $scope.resetData();

  }

  var loop = function()
  {

    if(textoSplit.length>$scope.indicePalabra)
    {

      var palabra = textoSplit[$scope.indicePalabra];
      var puntoCentral = calculaPuntoCentral(palabra);
      
      $scope.palabraActual = $sce.trustAsHtml(generaEspacios(puntoCentral)+colorea(palabra, puntoCentral));
      
      $scope.indicePalabra++;
      if($scope.leyendo)
        $timeout(loop, Math.floor((((palabra.length+2)/2)*$scope.speedBase) + $scope.speed));
    }
    else
    {
      $scope.leyendo = false;
      $scope.indicePalabra = 0;
    }
  }


  $scope.speedUp = function()
  {
    $scope.speed += $scope.speedFactor;
  }

  $scope.speedDown = function()
  {

   $scope.speed = Math.max(0,$scope.speed-$scope.speedFactor);
 }

 $scope.clearTextArea = function()
 {
  $scope.textoArea="";
  textoSplit = [];
  $scope.indicePalabra=0;
  $scope.palabraActual=$sce.trustAsHtml("&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;a-word");
  $scope.leyendo = false;
}




var calculaPuntoCentral = function(palabra)
{

  var puntoCentral = 1;

  switch ( palabra.length) {
    case 1:
    puntoCentral = 1; 
    break;
    case 2:
    case 3:
    case 4:
    case 5:
    puntoCentral = 2; 
    break;
    case 6:
    case 7:
    case 8:
    case 9:
    puntoCentral = 3; 
    break;
    case 10:
    case 11:
    case 12:
    case 13:
    puntoCentral = 4; 
    break;
    default:
    puntoCentral = 5; 
  };

  return puntoCentral;
}


var generaEspacios = function(puntoCentral)
{
  var espacios = 10;
  espacios = espacios - puntoCentral;
  var esp = "";
  for(var i = 0;i<espacios;i++)
  {
    esp+="&nbsp;"
  }

  return esp;
}


var colorea = function(palabra, indice)
{
 
  if (palabra.length <2)
    return '<span class="rojo">' + palabra + '</span>'
  else
    return palabra.substr(0,indice-1) + '<span class="rojo">' + palabra.substr(indice-1,1) + '</span>' + palabra.substr(indice,palabra.length);

}

}
