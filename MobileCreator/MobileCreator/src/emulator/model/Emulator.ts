/// <reference path="../../../lib/jquery.d.ts" />
import mLog = module("utils/log/Log");
import mButton = module("emulator/model/ui/Button");
import mTextView = module("emulator/model/ui/TextView");
import mLinearLayout = module("emulator/model/ui/LinearLayout");
import mButtonTag = module("emulator/model/attributes/ButtonTag");
import mLinearLayoutTag = module("emulator/model/attributes/LinearLayoutTag");
import mTextViewTag = module("emulator/model/attributes/TextViewTag");
import mImageViewTag = module("emulator/model/attributes/ImageViewTag");
import mImageView = module("emulator/model/ui/ImageView");
import mWebView = module("emulator/model/ui/WebView");
import mWebViewTag = module("emulator/model/attributes/WebViewTag");


export class Emulator {
    private logger = new mLog.Logger("Emulator");

    public static instance = new Emulator();

    constructor() {
    }

    public createView() {
        this.logger.log("createView");

        //TODO: stub
        var $screen = $("#screen");
        $screen.children().remove();
        //this.showVisitCard();
        this.showTestStub();
        //end stub
      
    }

    private showTestStub() {
        //TODO: stub
        var layoutTag = new mLinearLayoutTag.LinearLayoutTag();
        layoutTag.Id = "linear";
        layoutTag.Orientation = mLinearLayoutTag.LinearLayoutTag.Vertical;
        layoutTag.Background = "#e3e3e3"
        layoutTag.Width = -1;
        layoutTag.Height = -1;
        var layout = new mLinearLayout.LinearLayout(layoutTag);

        var webViewTag = new mWebViewTag.WebViewTag();
        webViewTag.Id = "webView";
        webViewTag.Url = "https://www.google.com";
        layoutTag.Width = -1;
        layoutTag.Height = -1;
        var webView = new mWebView.WebView(webViewTag);

        layout.addChild(webView);
        var $screen = $("#screen");
        var $layout = layout.$Control;
        $screen.append($layout);
        layout.create();

        //end stub
    }

    private showVisitCard() {

        var layoutTag = new mLinearLayoutTag.LinearLayoutTag();
        layoutTag.Id = "linear";
        layoutTag.Orientation = mLinearLayoutTag.LinearLayoutTag.Vertical;
        layoutTag.Background = "#e3e3e3"
        layoutTag.Width = -1;
        layoutTag.Height = -1;
        var layout = new mLinearLayout.LinearLayout(layoutTag);

        var innerLayoutTag = new mLinearLayoutTag.LinearLayoutTag();
        innerLayoutTag.Id = "innerLinear";
        innerLayoutTag.Orientation = mLinearLayoutTag.LinearLayoutTag.Vertical;
        innerLayoutTag.Background = "#e3e3e3"
        innerLayoutTag.MarginLeft = 20;
        innerLayoutTag.MarginRight = 20;
        //innerLayoutTag.MarginTop = 20;
        var innerLayout = new mLinearLayout.LinearLayout(innerLayoutTag);

        var logoTag = new mImageViewTag.ImageViewTag();
        logoTag.Id = "logo";
        logoTag.ImageUrl = "https://dl.dropbox.com/u/10802739/lt_logo.jpg";
        logoTag.Width = 300;
        logoTag.Height = 120;
        logoTag.Gravity = "center";
        logoTag.MarginTop = 30;
        var logo = new mImageView.ImageView(logoTag);

        var infoLabelTag = new mTextViewTag.TextViewTag();
        infoLabelTag.Id = "info";
        infoLabelTag.Text = "LANIT-TERCOM is one of the few Russian IT companies which are able not only to fulfil industrial contracts, but also to carry out challenging science-intensive programming projects.";
        infoLabelTag.MarginTop = 20;
        var label1 = new mTextView.TextView(infoLabelTag);

        var buttonTag = new mButtonTag.ButtonTag();
        buttonTag.Id = "button";
        buttonTag.Text = "Show more";
        buttonTag.MarginTop = 320;
        var button = new mButton.Button(buttonTag);

        innerLayout.addChild(logo);
        innerLayout.addChild(label1);
        innerLayout.addChild(button);
        layout.addChild(innerLayout);

        var $screen = $("#screen");
        var $layout = layout.$Control;
        $screen.append($layout);
        layout.create();
    }
}