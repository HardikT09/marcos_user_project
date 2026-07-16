const formatDate = (date) => {
    return new Intl.DateTimeFormat("en-IN", {
        timeZone: "Asia/Kolkata",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
    }).format(new Date(date));
};

const formatResponse = (data) => {
    if (Array.isArray(data)) {
        return data.map(formatResponse);
    }

    if (data && typeof data === "object") {
        const obj = data.toJSON ? data.toJSON() : { ...data };

        Object.keys(obj).forEach((key) => {
            if (
                key.toLowerCase().includes("createdat") ||
                key.toLowerCase().includes("updatedat") ||
                key.toLowerCase().includes("deletedat") ||
                key.toLowerCase().includes("expires")
            ) {
                if (obj[key]) {
                    obj[key] = formatDate(obj[key]);
                }
            } else if (
                obj[key] &&
                typeof obj[key] === "object"
            ) {
                obj[key] = formatResponse(obj[key]);
            }
        });

        return obj;
    }

    return data;
};

module.exports = formatResponse;
