export class Channel {

    channelName: string;
    description: string;
    privacy: string;


    constructor(obj?: any){
        this.channelName = obj ? obj.channelName : '';
        this.description = obj ? obj.description : '';
        this.privacy = obj ? obj.privacy : 'Public';
    }

    public toJSON(){
        return{
            channelName: this.channelName,
            description: this.description,
            privacy: this.privacy,
        };
    }
}