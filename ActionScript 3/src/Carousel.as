package
{
import com.vamapaull.view.Item;
import com.vamapaull.view.ToolTip;

import flash.display.Sprite;
import flash.events.Event;
import flash.events.MouseEvent;
import flash.net.URLLoader;
import flash.net.URLRequest;

[SWF(width="1000", height="750", frameRate="30", backgroundColor="#323232")]
public class Carousel extends Sprite
{
    public var numOfItems:Number;
    public var radiusX:Number = 300;
    public var radiusY:Number = 75;
    public var centerX:Number;
    public var centerY:Number;
    public var speed:Number = 0.05;
    public var perspective:Number = 130;
    public var itemsArray:Array = new Array();
    public var toolTip:ToolTip = new ToolTip();
    private var _currentItem:Item;

    public function Carousel()
    {
        toolTip.alpha = 0;

        centerX = stage.stageWidth / 2;
        centerY = stage.stageHeight / 2;

        var xmlLoader:URLLoader = new URLLoader();
        xmlLoader.addEventListener(Event.COMPLETE, handleXmlLoaderComplete);
        xmlLoader.load(new URLRequest("icons.xml"));

        stage.addEventListener(MouseEvent.MOUSE_MOVE, handleMouseMove);
    }

    protected function handleMouseMove(event:MouseEvent):void
    {
        speed = (stage.mouseX-centerX)/2500;
    }

    protected function handleXmlLoaderComplete(event:Event):void
    {
        var xml:XML = new XML(event.target.data);
        var xmlList:XMLList = xml.children();
        numOfItems = xmlList.length();
        for (var i:int = 0; i < numOfItems; i++)
        {
            var item:Item = new Item();
            item.addEventListener(MouseEvent.MOUSE_OVER, handleMouseOver);
            item.addEventListener(MouseEvent.MOUSE_OUT, handleMouseOut);
            item.addEventListener(MouseEvent.CLICK, handleMouseClick);
            item.load(xmlList[i].@image);
            item.toolTip = xmlList[i].@tooltip;
            item.angle = i * ((Math.PI*2)/numOfItems);
            addChild(item);
            itemsArray.push(item);

            _currentItem = item;
        }

        addEventListener(Event.ENTER_FRAME, handleEnterFrame);
        handleEnterFrame(null);
    }

    private function handleMouseClick(event:MouseEvent):void {
        trace("click");
    }

    protected function handleMouseOver(event:MouseEvent):void
    {
        toolTip.alpha = 1;
        _currentItem = event.currentTarget as Item;
    }

    protected function handleMouseOut(event:MouseEvent):void
    {
        toolTip.alpha = 0;
    }

    protected function handleEnterFrame(event:Event):void
    {
        for (var i:int = 0; i < numOfItems; i++)
        {
            itemsArray[i].x = Math.cos(itemsArray[i].angle) * radiusX + centerX;
            itemsArray[i].y = Math.sin(itemsArray[i].angle) * radiusY + centerY;
            var s:Number = (itemsArray[i].y - perspective) /(centerY+radiusY-perspective);
            itemsArray[i].scaleX = itemsArray[i].scaleY = s;
            itemsArray[i].angle += speed;

            this.setChildIndex(itemsArray[i], Math.round(itemsArray[i].scaleX) -1);
        }

        refreshItemsIndex();

        toolTip.text = _currentItem.toolTip;
        toolTip.x = _currentItem.x - (toolTip.width >> 1);
        toolTip.y = _currentItem.y - (_currentItem.height >> 1) - 50;
        addChild(toolTip);
    }

    private function refreshItemsIndex():void
    {
        itemsArray.sortOn("scaleX", Array.NUMERIC);

        for (var i:int = 0; i < numOfItems; i++)
        {
            addChild(itemsArray[i]);
        }
    }
}
}