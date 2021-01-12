const axios = require('axios');
const {AxiosRequestConfig, AxiosResponse} = require("axios");
const cheerio = require("cheerio");
const cookie = require("cookie");
require("dotenv").config();

class ClasseViva 
{

  static endpoints = {
    auth: "https://web.spaggiari.eu/auth-p7/app/default/AuthApi4.php?a=aLoginPwd",
    marks: "https://web.spaggiari.eu/cvv/app/default/genitori_note.php?filtro=tutto",
    notes: "https://web.spaggiari.eu/fml/app/default/gioprof_note_studente.php",
    today: "https://web.spaggiari.eu/cvv/app/default/regclasse.php",
    profile: "https://web.spaggiari.eu/acc/app/default/me.php?v=me",
    assignment: "https://web.spaggiari.eu/fml/app/default/didattica_genitori_new.php"
  }

  constructor(sessionId) {
    this.sessionid = sessionId;
  }

  static async establishSession(userId, userPassword) {
    const response = await axios.post(ClasseViva.endpoints.auth, new URLSearchParams({ uid: userId, pwd: userPassword, cid: "", pin: "", target: ""}).toString(), {headers: { "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8" }, responseType: "json"})
    const responseData = response.data;

    if (responseData.error.length > 0) return null;
    else return new ClasseViva(cookie.parse(response.headers["set-cookie"].pop()).PHPSESSID);
  }

  async getNotes() {
    const response = await this.request({ url: ClasseViva.endpoints.notes });
    const $ = cheerio.load(response.data);
    const notes = [];

    $("#sort_table tbody tr").each((i, note) => {
      notes.push({
				teacher: $(note).children(":first-child").text().trim(),
				date: $(note).children(":nth-child(2)").text().trim(),
				content: $(note).children(":nth-child(3)").text().trim(),
				type: $(note).children(":last-child").text().trim(),
      });
    });

    return notes;
  }

  async getMarks() {
    const response = await this.request({ url: ClasseViva.endpoints.marks });
    const $ = cheerio.load(response.data);
    const marks = [];
    
    $(".registro").each((i, row) => {
      const subject = $(row).text().trim();
      $(row).parent().nextUntil("tr[align=center]").each(((i, mark) => {
        marks.push({
          subject,
          mark: $(mark).find(".s_reg_testo").text().trim(),
					type: $(mark).find(".voto_data").last().text().trim(),
					description: $(mark).find("[colspan=32]").find("span").text().trim(),
					date: $(mark).find(".voto_data").first().text().trim()
        });
      }));
    });

    return marks;
  }

  async getToday(dateTime) {
    let $;
    if (dateTime == undefined) {
      const response = await this.request({ url: ClasseViva.endpoints.today });
      $ = cheerio.load(response.data);
    }
    else {
      const date = new Date(dateTime);

      let day = date.getDate();
      let month = date.getMonth() + 1;
      let year = date.getFullYear();
      
      if(day < 10)
        day = "0" + day;
      if (month < 10)
        month = "0" + month;

      const response = await this.request({ url: ClasseViva.endpoints.today + `?data_start=${year}-${month}-${day}` });
      $ = cheerio.load(response.data);
    }



    const presences = [];
    $(".registro.rigtab.firma_stato div.whitetext").each((i, row) => {
      if (!$(row).hasClass("cella_registro") && $(row).text().trim() != undefined) 
        presences.push({
          status: $(row).text().trim(),
          length: $(row).attr("xt:nh")
        });
    });


    const subjects = [];
    $("tbody .rigtab[align=center]").each((i, line) => {
      if ($(line).attr("id") == undefined && $(line).children().length > 1)
        subjects.push({
          teacherName: $(line).find(".registro_firma_dett_docente").text().trim(),
          lessonType: $(line).find(".registro_firma_dett_argomento_lezione b").text().trim(),
          lessonArgument: $(line).find(".registro_firma_dett_argomento_lezione .registro_firma_dett_argomento_nota").text().trim(),
          subject: $(line).find(".registro_firma_dett_materia").children(":first-child").text().trim(),
          hour: $(line).find(".registro_firma_dett_ora").text().trim().split("^")[0],
          hoursDone: $(line).find(".registro_firma_dett_ora").text().trim().split("^")[1].replace("(", "").replace(")", "")
        });
    });

    return {presences, subjects};
  }

  async getAssignments() {
    let response = await this.request({ url: ClasseViva.endpoints.assignment });
    let $ = cheerio.load(response.data);

    const assignments = [];
    const pageCount = $("#data_table tbody tr:last-child td:nth-child(5) strong").text().trim().split("/")[1];

    for (let i = 1; i <= pageCount; i++) {
      response = await this.request({ url: ClasseViva.endpoints.assignment + `?p=${i}` });
      $ = cheerio.load(response.data);

      $(".row.contenuto").each((i, line) => {
        assignments.push({
          teacherName: $(line).find(":nth-child(2) div").text().trim(),
          assignmentTitle: $(line).find(":nth-child(4) div span:nth-child(1)").text().trim(),
          date: $(line).find(":nth-child(6) div").text().trim()
        });
      });
    }

    return assignments;
  }

  async getProfile() {
    const response = await this.request({ url: ClasseViva.endpoints.profile });
    const $ = cheerio.load(response.data);
    let schoolName = $("#top_page_name_div div:first-child .open_sans_condensed.font_size_14.graytext").clone().children().remove().end().text().trim();

    const profile = {
      name: $("#top_page_name_div div:first-child .open_sans_extrabold.font_size_28.graytext").text().trim(),
      uid: $("#top_page_name_div div:first-child .open_sans_extrabold.font_size_12.graytext").text().trim(),
      pic: "https://web.spaggiari.eu/img/"+$(".top_div_foto").children(":first-child").attr("src").split("img/")[1],
      schoolName
    };

    return profile;
  }

  // async getArguments() {
  //   let response = await this.request({ url: ClasseViva.endpoints.profile });
  //   let $ = cheerio.load(response.data);
  // }

  request(config) {
    config.headers = config.headers ?? {};
    config.headers["Cookie"] = cookie.serialize("PHPSESSID", this.sessionid);
    return axios.request(config);
  }

}

module.exports.ClasseViva = ClasseViva;
