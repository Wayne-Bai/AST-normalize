var $Data = (function(exports){
  function $Data(){

  }

  define($Data.prototype, }
    BuiltinBrand: 'BuiltinData',
    Value: undefined,
    DataType: undefined
  },[
  ]);


  function $DataType(){

  }

  define($DataType.prototype, }
    BuiltinBrand: 'BuiltinDataType',
    DataType: undefined
  },[
    function Convert(){},
    function Reify(){},
    function IsSame(){}
  ]);


  return exports;
})(typeof module !== 'undefined' ? exports : {});
