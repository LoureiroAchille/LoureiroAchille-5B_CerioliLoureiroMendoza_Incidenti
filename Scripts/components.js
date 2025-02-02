import{upload,download,login_fetch} from "./cache.js";
import { addMarker } from "./functions.js";

const createForm = (elem) => {
  let data;
  let element = elem;
  let callback;
  return {
      setLabels: (labels) => { data = labels; },
      setCallback: (f) => { callback = f; },
      render: () => {
          const today = new Date().toISOString().split("T")[0]; // Ottiene la data in formato YYYY-MM-DD

          element.innerHTML = data.map(([label, type]) => {
              let maxAttr = "";
              if (type === "date") {
                  maxAttr = `max="${today}"`;
              }
              return `<div>${label}</div><div><input  id="${label}" type="${type}" ${maxAttr}></div>`;
          }).join('');

          element.innerHTML += `<button type="button" id="chiudi">Chiudi</button>`;
          element.innerHTML += `<button type="button" id="invia">Invia</button>`;

          document.getElementById("chiudi").onclick = () => {
              elem.style.display = "none";
              document.getElementById("overlay").style.display = "none";
          };

          document.getElementById("invia").onclick = () => {
              const result = data.map(([label]) => {
                  return document.getElementById(label).value;
              });

              // verifica il campo delle targhe (se esiste)
              const platesField = result.find((value, index) => data[index][0] === "Targhe"); // trova il campo "Targhe"
          
              if (platesField) {
                  const plates = platesField.split(",").map((plate) => plate.trim()); // Divide e rimuove gli spazi
                  if (plates.length > 3) {
                    alert("Non puoi inserire più di 3 targhe!");
                    return; // blocca l'invio se ci sono più di 3 targhe
                }
              }

              elem.style.display = "none";
              document.getElementById("overlay").style.display = "none";

              callback(result).then((object) => {
                  console.log(object);

                  download().then((places) => {
                      places.push(object); // Aggiunta incidente
                      upload(places).then(() => {
                          renderMap();
                          alert("Incidente aggiunto con successo!");
                          data.map((line) =>
                              document.getElementById(line[0]).value = "" // Reset dei campi
                          );
                      });
                  });
              });
          };
      },
  };
};

//creazione iniziale
  let zoom = 12;
  let maxZoom = 19;
  let map = L.map('map').setView([45.4654219,9.1859243], zoom);
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: maxZoom,
  attribution: '© <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  }).addTo(map);
  
const renderMap = () => {
      download().then((places) => {
        places.forEach((place) => {
          const marker = L.marker(place.coords).addTo(map);
          marker.bindPopup(`
              <b>${place.name}</b><br>
              <b>Data:</b> ${place.date}<br>
              <b>Ora:</b> ${place.time}<br>
              <b>Feriti:</b> ${place.injured}<br>
              <b>Morti:</b> ${place.dead}`);
        });
      })
  }
/* 
  download().then((places) => {
    console.log(places);
      const map = L.map('map').setView([45.4654219, 9.1859243], 12);
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '© <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      }).addTo(map);
  });
};*/



function createTable() {
    const container = document.getElementById('table');
  
    // Scarica dati
    download().then((places) => {
      //Crea la tabella
      let tableHtml = `
        <input type="text" id="FiltroInput" placeholder="Cerca per indirizzo">
        <table class="table-striped">
          <thead>
            <tr>
              <th>Indirizzo</th>
              <th>Data</th>
              <th>Ora</th>
              <th>Targhe Coinvolte</th>
              <th>Feriti</th>
              <th>Morti</th>
            </tr>
          </thead>
          <tbody id="tabella_aggiornata">
            ${places.map((place) => `
              <tr>
                <td>${place.name}</td>
                <td>${place.date}</td>
                <td>${place.time}</td>
                <td>${place.plates}</td>
                <td>${place.injured}</td>
                <td>${place.dead}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
      container.innerHTML = tableHtml;
  
      // filtra i dati della tabella
      document.getElementById('FiltroInput').addEventListener('input', function() {
        const filter = document.getElementById('FiltroInput');
        const filteredPlaces = places.filter(place => place.name.toLowerCase().includes(filter.value));

  
        //tabella aggiornata
        const tbody = document.getElementById('tabella_aggiornata');
        tbody.innerHTML = filteredPlaces.map((place) => `
          <tr>
            <td>${place.name}</td>
            <td>${place.date}</td>
            <td>${place.time}</td>
            <td>${place.plates}</td>
            <td>${place.injured}</td>
            <td>${place.dead}</td>
          </tr>
        `).join('');
      });
    });
  }
  /*const handleAddIncident = () => {
    const formContainer = document.getElementById('form');

    const formHtml = `
        <div id="incidentForm">
            <h3>Inserisci Nuovo Incidente</h3>
            <div>Indirizzo: <input id="address" type="text"></div><br>
            <div>Targhe Coinvolte: <input id="plates" type="text"></div><br>
            <div>Data e Ora: <input id="dateTime" type="datetime-local"></div><br>
            <div>Feriti: <input id="injured" type="number"></div><br>
            <div>Morti: <input id="dead" type="number"></label><br>
            <button id="saveIncidentButton">Salva Incidente</button>
        </div>
    `;

    formContainer.innerHTML = formHtml;

    document.getElementById('saveIncidentButton').onclick = () => {
        const newIncident = {
            name: document.getElementById('address').value,
            plates: document.getElementById('plates').value.split(','),
            date: document.getElementById('dateTime').value,
            injured: parseInt(document.getElementById('injured').value),
            dead: parseInt(document.getElementById('dead').value),
            coords: [45.4654219, 9.1859243], // Coordinate di default (Milano)
        };

        download().then((places) => {
            places.push(newIncident);
            console.log(places);
            upload(places).then(() => {
                addMarker(places[length(places)-1]);
                alert("Incidente aggiunto con successo!");
            });
        });
    };
};
*/


const createLogin = (elem) => {
  let data;
  let element = elem;
  let callback;
  return {
      setLabels: (labels) => { data = labels; },
      setCallback: (f) => { callback = f; },
      render: () => {
          element.innerHTML = data.map(([label, type]) => {
              return `<div>${label}</div><div><input id="${label}" class="input_css" type="${type}"></div>`;
          }).join('');

          element.innerHTML += `<button type="button" id="chiudi_login">Chiudi</button>`;
          element.innerHTML += `<button type="button" id="invia_login">Accedi</button>`;

          document.getElementById("chiudi_login").onclick = () => {
              elem.style.display = "none";
              document.getElementById("overlay").style.display = "none";
          };

          document.getElementById("invia_login").onclick = () => {
              const username = document.getElementById("Username").value;
              const password = document.getElementById("Password").value;

              login_fetch(username, password)
                  .then((isValid) => {
                      if (isValid) {
                          document.getElementById("modale").style.display = "block";
                          elem.style.display = "none";
                          document.getElementById("overlay").style.display = "none";
                          console.log("Accesso riuscito!");
                          alert("Benvenuto!");

                          Cookies.set('Username',username)
                          Cookies.set('Password',password)
                          console.log(document.cookie)

                          data.forEach(([label]) => {
                              document.getElementById(label).value = "";
                          });

                      } else {
                          console.log("Accesso fallito. Credenziali errate.");
                          alert("Accesso negato. Controlla le credenziali.");
                          data.forEach(([label]) => {
                              document.getElementById(label).value = "";
                          });
                      }
                  })
                  .catch((error) => {
                      console.error("Errore durante il login:", error);
                      alert("Si è verificato un errore. Riprova più tardi.");
                  });
          };
      },
  };
};






export{createForm,renderMap,createTable,createLogin};