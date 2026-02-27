import publicApi from "./publicApi.config.js";

export const getFeaturedHotels = async () => {
    const res = await publicApi.get("/hotels");
    return res.data.result;
};


