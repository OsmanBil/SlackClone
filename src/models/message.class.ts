export class Message {

    text: any;
    date: any;
    


    constructor(obj?: any){
        this.text = obj ? obj.text : '';
        this.date = obj ? obj.date : '';

       
    }

    public toJSON(){
        return{
            text: this.text,
            date: this.date

        };
    }
}