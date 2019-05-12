function getServerErr(err) {
    if (err.response === undefined) {
      return err;
    }

    let data = err.response.data;
    if (typeof data === "object" && data.error) {
      return data.error;
    }

    return "Unknown server error";
 }

export default getServerErr;
