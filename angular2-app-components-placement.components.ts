import {Component, Input} from "angular2/core";
import {NgGrid, NgGridItem} from "angular2-grid";
import {Http, HTTP_PROVIDERS, Response, Headers} from "angular2/http";
import "rxjs/operator/map";

@Component({
    selector: 'hpe-placement',
    templateUrl: './app/views/placement.html',
    viewProviders: [HTTP_PROVIDERS],
    directives: [NgGrid, NgGridItem]
})

export class PlacementComponent {
    @Input()
    serverName;
    @Input()
    activeSiteId;
    public qaCollections;
    public preProdCollections;
    public prodCollections;
    public qaErrors;
    public preProdErrors;
    public prodErrors;
    public qaPromoMessage;
    public ppPromoMessage;
    public prodPromoMessage;
    public showLoader:boolean = true;
    public promoMessageId;
    public promMsg;
    public infoMessage;
    public closeErr = false;
    public closeInf = false;

    public preMoveRowIndex; //starts from 0
    public postMoveRowIndex;

    private gridConfig = {
        'max_cols': 1,
        'min_cols': 1,
        'auto_resize': true,
        'margins': [0]
    };

    private gridItemConfig = {
        'sizey': 0,
        'resizable': false,
        'dragHandle': '',
        'col': 1,
        // 'row': i
    }

    constructor(private http:Http) {
    }

    ngOnInit() {
        this.gridItemConfig.dragHandle = '.draggable' + this.serverName;
        this.promoMessageId = 'promoMessage' + this.serverName;
        this.showLoader = true;
        this.getCollection();
    }

    getCollection() {
        this.infoMessage = null; //reset info message
        this.http.get("/todayget/" + this.activeSiteId).map((res:Response)=> res.json()).subscribe(
            data => {
                var collections = data;
                for (var key in data) {
                    if (data[key].hasOwnProperty('qa')) {
                        data[key].qa.displayInformation["promotionalMessage"] = data[key].qa.displayInformation["promotionalMessage"] != null ? data[key].qa.displayInformation.promotionalMessage : '';
                        this.qaCollections = data[key].qa.collections;
                        this.qaPromoMessage = data[key].qa.displayInformation;
                        this.qaErrors = data[key].qa.errors;
                    }
                    else if (data[key].hasOwnProperty('pp')) {
                        data[key].pp.displayInformation["promotionalMessage"] = data[key].pp.displayInformation["promotionalMessage"] != null ? data[key].pp.displayInformation.promotionalMessage : '';
                        this.preProdCollections = data[key].pp.collections;
                        this.ppPromoMessage = data[key].pp.displayInformation;
                        this.preProdErrors = data[key].pp.errors;
                    }
                    else if (data[key].hasOwnProperty('prod')) {
                        data[key].prod.displayInformation["promotionalMessage"] = data[key].prod.displayInformation["promotionalMessage"] != null ? data[key].prod.displayInformation.promotionalMessage : '';
                        this.prodCollections = data[key].prod.collections;
                        this.prodPromoMessage = data[key].prod.displayInformation;
                        this.prodErrors = data[key].prod.errors;
                    }
                }
                this.promMsg = this.getPromoMessage();
                this.showLoader = false;
            },
            err => this.logError(err),
            () => console.log("** get collections api call complete **")
        );
    }

    logError(err) {
        console.error('There was an error: ' + err);
    }

    postCollection() {
        this.infoMessage = null; //reset info message
        var headers = new Headers();
        headers.append('Content-Type', 'application/json');

        // populating the post request body
        var data = {};
        data["collections"] = this.getCollections();
        data['displayInformation'] = this.getCurrentPromoMessage();
        data['displayInformation']['promotionalMessage'] = this.promMsg;
        data["server"] = this.serverName;

        this.http.post("/todaypost/" + this.activeSiteId, JSON.stringify(data), {headers: headers}).map((res:Response)=> res.json()).subscribe(
            data => {
                if (JSON.parse(data).ack === 'SUCCESS')
                    this.infoMessage = "Site " + this.activeSiteId + " successfully updated."
            },
            err => this.logError(err),
            () => console.log("** post collections api call complete **")
        );
    }

    getCollections() {
        return this.serverName == 'qa' ? this.qaCollections :
            this.serverName == 'pp' ? this.preProdCollections :
                this.serverName == 'prod' ? this.prodCollections : '';
    }

    getErrors() {
        return this.serverName == 'qa' ? this.qaErrors :
            this.serverName == 'pp' ? this.preProdErrors :
                this.serverName == 'prod' ? this.prodErrors : '';
    }

    getPromoMessage() {
        return (this.getCurrentPromoMessage() != null ? this.getCurrentPromoMessage()["promotionalMessage"] : '');
    }

    getCurrentPromoMessage() {
        return this.serverName == 'qa' ? this.qaPromoMessage :
            this.serverName == 'pp' ? this.ppPromoMessage :
                this.serverName == 'prod' ? this.prodPromoMessage : null;
    }

    onDragStart(index:number, pos:{ col:number, row:number, sizex:number, sizey:number }) {
        this.preMoveRowIndex = pos.row - 1;
        // console.log("Pre move: placementId:  " + index + ", row: " + this.preMoveRowIndex);
    }


    onDragStop(index:number, pos:{ col:number, row:number, sizex:number, sizey:number }) {
        this.postMoveRowIndex = pos.row - 1;
        // console.log("Post move: placementId:  " + index + ", row: " + this.postMoveRowIndex);

        // logic to swap the order of elements between the preMoveRowIndex to postMoveRowIndex in the getCollections object
        var coll = this.getCollections();
        if (this.postMoveRowIndex == this.preMoveRowIndex) {
            // console.log("no movement");
            return;
        }
        else if (this.postMoveRowIndex < this.preMoveRowIndex) { //bottom to top movement
            // console.log("bottom to top movement");
            var temp = coll[this.preMoveRowIndex];
            var prev = this.preMoveRowIndex;
            for (var i = this.preMoveRowIndex - 1; i >= this.postMoveRowIndex; i--) { // intermediary rows come down by 1
                coll[prev] = coll[i];
                coll[prev]["placementId"] = coll[prev]["placementId"] + 1;
                prev = i;
            }
            coll[prev] = temp;
            coll[prev]["placementId"] = this.postMoveRowIndex + 1;
        } else { // top to bottom movement
            // console.log("top to bottom movement");
            var temp = coll[this.preMoveRowIndex];

            var prev = this.preMoveRowIndex;
            for (var i = this.preMoveRowIndex + 1; i <= this.postMoveRowIndex; i++) { // intermediary rows go up by 1
                coll[prev] = coll[i];
                coll[prev]["placementId"] = coll[prev]["placementId"] - 1;
                prev = i;
            }
            coll[prev] = temp;
            coll[prev]["placementId"] = this.postMoveRowIndex + 1;
        }
    }

    addPlacement(event) {
        this.getCollections().push({collection: {}, longTitle: '', placementId: this.getCollections().length + 1});
    }

    showCopyButton() {
        return this.serverName == 'qa' ? false : true;
    }

    hasErrors() {
        var errors = this.getErrors();
        return (errors[0] != null);
    }

    hasInfoMsgs() {
        return this.infoMessage != null ? true : false;
    }

    closeError() {
        this.closeErr = true;
    }

    closeInfo() {
        this.closeInf = true;
    }
}
