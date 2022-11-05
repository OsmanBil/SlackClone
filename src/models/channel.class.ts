export class Channel {

    channelName: string;
    description: string;
    privacy: string;
    posts: Channel[];


    constructor(obj?: any){
        this.channelName = obj ? obj.channelName : '';
        this.description = obj ? obj.description : '';
        this.privacy = obj ? obj.privacy : 'public';
        this.posts = obj ? obj.posts : '';
    }

    public toJSON(){
        return{
            channelName: this.channelName,
            description: this.description,
            privacy: this.privacy,
            posts: this.posts
        };
    }
}