require("dotenv").config();
const puppeteer = require("puppeteer");
const Instauto = require("instauto");

const options = {
    cookiesPath: "./database/cookies.json",

    username: process.env.USER_NAME,
    password: process.env.PASSWORD,

    //Set restrictions you want
    //Dont set too high because instagram can
    maxFollowsPerHour: 5,
    maxFollowsPerDay: 20,
    maxLikesPerDay: 50,

    followUserRatioMin: 0.8,
    followUserRatioMax: 5.0,

    followUserMaxFollowers: null,
    followUserMaxFollowing: null,
    followUserMinFollowers: null,
    followUserMinFollowing: null,

    dontUnfollowUntilTimeElapsed: 3 * 24 * 60 * 60 * 1000,
    excludeUsers: [],

    //If dry run is true it will do everything except actions (follow, unfollow, and like)
    dryRun: false,
};

(async () => {
    let browser;

    try {
        //toggle headles to true to work in background
        const browser = await puppeteer.launch({
            headless: false,
            ignoreHTTPSErrors: true,
            args: [`--window-size=800,736`], //window size
            defaultViewport: {
                width: 780, //set custom browser width in px
                height: 736, //set custom browser height in px
            },
        });

        //Creating JSON databases to store data
        const instautoDb = await Instauto.JSONDB({
            followedDbPath: "./database/followed.json",
            unfollowedDbPath: "./database/unfollowed.json",
            likedPhotosDbPath: "./database/liked-photos.json",
        });

        const instauto = await Instauto(instautoDb, browser, options);

        //Unfollow all the users that didnt followed back
        await instauto.unfollowNonMutualFollowers();
        await instauto.sleep(10 * 60 * 1000);

        //After 3 days if they dont follow, unfollow them
        const unfollowedCount = await instauto.unfollowOldFollowed({
            ageInDays: 3,
            limit: options.maxFollowsPerDay * (2 / 3),
        });

        if (unfollowedCount > 0) await instauto.sleep(10 * 60 * 1000);

        const usersToFollowFollowersOf = ["photo_by.cs"];

        await instauto.followUsersFollowers({
            usersToFollowFollowersOf,
            maxFollowsTotal: options.maxFollowsPerDay - unfollowedCount,
            skipPrivate: true,
            enableLikeImages: true,
            likeImagesMax: 3,
        });

        await instauto.sleep(10 * 60 * 1000);

        console.log("Done running");

        await instauto.sleep(30000);
    } catch (err) {
        console.error(err);
    } finally {
        console.log("Closing browser");
        if (browser) await browser.close();
    }
})();