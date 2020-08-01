/**
 * @fileoverview �����ı���
 * @author ����<yilian.wj@taobao.com>
 * @date 12-4-22
 */
KISSY.add('gallery/form/1.1/number/base', function(S, Node, Base){
	var $ = Node.all;
	/**
	 * @name Number
	 * @class �����ı���
	 * @constructor
	 * @extends Base
	 * @param {String} target Ŀ��
	 * @param {Object} config �������
	 * @example
	 * var ck = new Number('#J_Content input',{trigger:{plus:'#J_Plus',minus:'#J_Minus'}})
	 */
	function Number(target, config) {
		
		var self = this;
		config = S.merge({target: $(target)},config);
		//���ø��๹����
		Number.superclass.constructor.call(self, config);
	}

	S.extend(Number, Base,  /** @lends Number.prototype*/{
		/*
		* ����
		*/
		render: function(){
			var self = this,$target = self.get('target');
            if(!$target.length) return false;
            self.eventOnChangeNum();
            self.eventOnValide();
		},

		eventOnChangeNum: function(){
			var self = this, $target = self.get('target'), inputValue = $target.val(), range = $target.attr('data-range') || 1,
			trigger = self.get('trigger'), $plus = $(trigger.plus), $minus = $(trigger.minus),
			numValidation = self.numValidation;
			
			$plus.on('click', function(){	
				inputValue += +range;
				numValidation($target);
			});
			$minus.on('click',function(){
				inputValue -= +range;
				numValidation($target);
			})
		},
		eventOnValide: function(){
			var self = this, $target = self.get('target');
			$target.on('blur',function(){
				numValidation($target);
			})
		},

		formatPrice: function(){
            return parseFloat(value, 10);			
		},
		/**
		 * [numValidation �������֤��У��]
		 * @param  {[NodeList]} target [�ı���ڵ����]
		 */
        numValidation: function(target){
			var self = this,formatPrice = self.formatPrice,
			min = formatPrice($target.attr('data-min')) || '',
			max = formatPrice($target.attr('data-max')) || '',
			inputValue = formatPrice($target.val().replace(/[^\d\.]/g, ''));
			inputValue = isNaN(inputValue) ? min : Math.max(min, inputValue);
			inputValue = max && Math.min(max, inputValue);
			
			target.val(inputValue.toFixed(2));
        }
	},{
		ATTRS: /** @lends Number.prototype*/{
			/**
			 * ���õ�Ŀ��,ѡ�������ַ���
			 * @type {String}
			 */
			target: {
				value: '',
				setter: function(v) {
					return $(v);
				},
				getter: function(v) {
					return $(v);
				}
			},

			/*
			* �����Ӽ��İ�ť
			*/
			trigger: {
				value: ''
			}
		}
	})
},{requires:['node','base']});