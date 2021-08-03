import mongodb from "mongodb"
const ObjectId = mongodb.ObjectID

let reviews

export default class ReviewsDAO {
    static async injectDB(conn) {
        if (reviews) {
            return
        }
        try {
            reviews = await conn.db(process.env.RESTREVIEWS_NS).collection("reviews")
        } catch (e) {
            console.error(`Unable to establish collection handles in userDAO: ${e}`)
        }
    }

    static async getReviews({
        filters = null,
        page = 0,
        reviewsPerPage = 10
    } = {}) {
        let query
        if(filters){
            if("date" in filters){
                query = {
                    "date": {
                        $eq: filters["date"]
                    }
                }
            }
        }

        let cursor

        try{
            cursor = await reviews
                .find(query)
        } catch (e) {
            console.error(`Unable to issue find command, ${e}`)
            return {
                reviewList: [],
                totalNumReviews: 0
            }
        }

        const displayCursor = cursor.limit(reviewsPerPage).skip(reviewsPerPage * page)

        try{
            const reviewList = await displayCursor.toArray()
            const totalNumReviews = await reviews.countDocuments(query)

            return { reviewList, totalNumReviews}
        } catch (e) {
            console.error(`Unable to convert cursor to array or problem counting documents, ${e}`)
            return {reviewList: [], totalNumReviews: 0}
        }
    }

     static async addReview(restaurantId, user, review, date) {
         try {
             const reviewDoc = {
                 name: user.name,
                 user_id: user._id,
                 date: date,
                 text: review,
                 restaurant_id: ObjectId(restaurantId),
             }

             return await reviews.insertOne(reviewDoc)
         } catch (e) {
             console.error(`Unable to post review: ${e}`)
             return {
                 error: e
             }
         }
     }

     static async updateReview(reviewId, userId, text, date) {
         try {
             const updateResponse = await reviews.updateOne({
                 user_id: userId,
                 _id: ObjectId(reviewId)
             }, {
                 $set: {
                     text: text,
                     date: date
                 }
             }, )

             return updateResponse
         } catch (e) {
             console.error(`Unable to update review: ${e}`)
             return {
                 error: e
             }
         }
     }

     static async deleteReview(reviewId, userId) {

         try {
             const deleteResponse = await reviews.deleteOne({
                 _id: ObjectId(reviewId),
                 user_id: userId,
             })

             return deleteResponse
         } catch (e) {
             console.error(`Unable to delete review: ${e}`)
             return {
                 error: e
             }
         }
     }
}