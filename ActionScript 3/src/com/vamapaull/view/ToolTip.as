package com.vamapaull.view
{
	import flash.display.Sprite;
	import flash.text.TextField;
	import flash.text.TextFieldAutoSize;
	import flash.text.TextFormat;
	
	public class ToolTip extends Sprite
	{
		private var _roundRect:Sprite = new Sprite();
		private var _textField:TextField = new TextField();
		private var _text:String;
		
		public function ToolTip()
		{
			super();
			
			_textField.x = 20;
			_textField.y = 6;
			_textField.text = "Default Text Here";
			_textField.autoSize = TextFieldAutoSize.LEFT;
			_textField.defaultTextFormat = new TextFormat("Arial", 20, 0x333333, true);
			
			addChild(_roundRect);
			addChild(_textField);
		}

		public function get text():String
		{
			return _text;
		}

		public function set text(value:String):void
		{
			_text = value;
			_textField.text = _text;
			_roundRect.graphics.clear();
			_roundRect.graphics.beginFill(0xFFFFFF);
			_roundRect.graphics.drawRoundRect(0, 0, _textField.width + 40, 40, 20, 20);
			_roundRect.graphics.endFill();
		}

	}
}