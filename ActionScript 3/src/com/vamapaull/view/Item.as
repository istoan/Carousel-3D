package com.vamapaull.view
{
	import flash.display.Bitmap;
	import flash.display.BitmapData;
	import flash.display.Loader;
	import flash.display.Sprite;
	import flash.events.Event;
	import flash.events.MouseEvent;
	import flash.geom.Point;
	import flash.geom.Rectangle;
	import flash.net.URLRequest;
	
	public class Item extends Sprite
	{
		public var toolTip:String;
		public var angle:Number;
		private var _imageLoader:Loader = new Loader();
		private var overlay:Bitmap;
		
		public function Item()
		{
			super();

			buttonMode = true;
			mouseChildren = false;
			
			addEventListener(MouseEvent.MOUSE_OVER, handleMouseOver);
			addEventListener(MouseEvent.MOUSE_OUT, handleMouseOut);
			
			_imageLoader.contentLoaderInfo.addEventListener(Event.COMPLETE, handleImageLoaderComplete);
		}
		
		protected function handleMouseOver(event:MouseEvent):void
		{
			overlay.alpha = 1;
		}
		
		protected function handleMouseOut(event:MouseEvent):void
		{
			overlay.alpha = 0;
		}
		
		private function handleImageLoaderComplete(event:Event):void {
			var bitmap:Bitmap = event.target.content;
			if(bitmap != null){
				bitmap.smoothing = true;
			}
			addChild(bitmap);
			
			bitmap.x -= bitmap.width >> 1;
			bitmap.y -= bitmap.height >> 1;
			
			var outputBitmapData:BitmapData = new BitmapData(bitmap.width, bitmap.height, true); 
			var destPoint:Point = new Point(0, 0); var sourceRect:Rectangle = new Rectangle(0, 0, outputBitmapData.width, outputBitmapData.height); 
			var threshold:uint =  0xFF111111;  
			var color:uint = 0xFFFF0000;     
			outputBitmapData.threshold(bitmap.bitmapData, sourceRect, destPoint, "==", threshold, color, 0xFFFFFFFF, true);
			
			overlay = new Bitmap(outputBitmapData);
			overlay.x = bitmap.x;
			overlay.y = bitmap.y;
			overlay.alpha = 0;
			addChild(overlay);
		}
		
		public function load(url:String):void {
			_imageLoader.load(new URLRequest(url));
		}
	}
}