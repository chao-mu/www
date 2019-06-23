import moment from 'moment';

export default {
  getServerErr: (err) => {
    if (err.response === undefined) {
      return err;
    }

    let data = err.response.data;
    if (typeof data === "object" && data.error) {
      return data.error;
    }

    return "Unknown server error";
  },

  convertTime: (time) => {
    let t =  moment(time, 'HH:mm', true);
    if (t.isValid()) {
      return time;
    }

    ["h:mma", "ha", "h a", "h:mm a"].forEach((fmt) =>  {
      if (!t.isValid()) {
        t = moment(time, fmt, true);
      }
    });

    if (t.isValid()) {
      return t.format("HH:mm");
    }

    return null;
  }
};
