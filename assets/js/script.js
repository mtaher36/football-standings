// URL API untuk mendapatkan daftar liga
const apiUrl = 'http://api-football-standings.azharimm.dev/leagues';

// Fungsi untuk mengambil data dari API menggunakan AJAX
function fetchLeagues() {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', apiUrl);
    xhr.onload = function () {
      if (xhr.status === 200) {
        resolve(JSON.parse(xhr.responseText).data);
      } else {
        reject('Error fetching leagues. Status:', xhr.status);
      }
    };
    xhr.onerror = function () {
      reject('Error fetching leagues.');
    };
    xhr.send();
  });
}

// Fungsi untuk menambahkan pilihan liga ke dalam elemen select
async function addLeagueOptions() {
  const selectElement = document.getElementById('leagueSelect');

  try {
    // Ambil data liga dari API menggunakan AJAX
    const leagues = await fetchLeagues();

    // Perulangan untuk setiap objek liga
    leagues.forEach((league) => {
      // Buat elemen option baru
      const optionElement = document.createElement('option');

      // Set atribut value dan text dari option
      optionElement.value = league.id;
      optionElement.textContent = league.name;

      // Tambahkan option ke dalam elemen select
      selectElement.appendChild(optionElement);
    });
  } catch (error) {
    console.error('Error:', error);
  }
}

// Panggil fungsi addLeagueOptions untuk menambahkan pilihan liga saat halaman dimuat
document.addEventListener('DOMContentLoaded', function () {
  addLeagueOptions();
});

// Fungsi untuk menampilkan data standing
function displayStandings(container, standings) {
  // Bersihkan kontainer
  container.innerHTML = '';

  // Buat tabel untuk menampilkan standing
  const table = document.createElement('table');
  table.classList.add(
    'table',
    'table-striped',
    'table-bordered',
    'table-hover'
  );
  // table.border = '1';
  // table.style.borderCollapse = 'collapse';
  // table.style.width = '100%';

  // Buat header tabel
  const thead = document.createElement('thead');
  const headerRow = document.createElement('tr');
  const headers = ['Pos', 'Team', 'PTS', 'MP', 'W', 'L', 'D', 'GF', 'GA', 'GD'];
  headers.forEach((headerText) => {
    const th = document.createElement('th');
    th.textContent = headerText;
    headerRow.appendChild(th);
  });
  thead.appendChild(headerRow);
  table.appendChild(thead);

  // Buat body tabel
  const tbody = document.createElement('tbody');
  standings.forEach((teamStanding, index) => {
    const row = document.createElement('tr');
    const { team, stats, note } = teamStanding;
    const { displayName, logos } = team;
    const rank = index + 1;

    // Create a Cell for Rank
    const rankCell = document.createElement('td');
    rankCell.textContent = rank;
    row.appendChild(rankCell);

    // Create a cell for Team Name and logo
    const teamCell = document.createElement('td');
    const teamInfo = document.createElement('div');
    teamInfo.classList.add('team-info');

    // Add Team Logo
    const teamLogo = document.createElement('img');
    const teamLogoSrc = logos && logos.length > 0 ? logos[0].href : '';
    teamLogo.src = teamLogoSrc; // Using the URL logo stored in rowData
    teamLogo.alt = displayName + ' Logo'; // Set the alt text for the logo
    teamInfo.appendChild(teamLogo);

    // Add team name
    const teamName = document.createElement('span');
    teamName.textContent = displayName;
    teamInfo.appendChild(teamName);

    teamCell.appendChild(teamInfo);
    row.appendChild(teamCell);

    // Create cells for stats
    const statData = [
      'points',
      'gamesPlayed',
      'wins',
      'losses',
      'ties',
      'pointsFor',
      'pointsAgainst',
      'pointDifferential',
    ];
    statData.forEach((statName, cellIndex) => {
      const statCell = document.createElement('td');
      if (cellIndex === statData.length - 1) {
        // Jika ini kolom terakhir (untuk Note Description)
        if (note && note.color) {
          // Periksa apakah note dan color tidak null
          row.style.backgroundColor = note.color; // Atur warna latar belakang sesuai dengan warna yang diberikan pada note
        }
      }
      statCell.textContent = getStatValue(stats, statName);
      row.appendChild(statCell);
    });
    tbody.appendChild(row);
  });
  table.appendChild(tbody);
  // Tambahkan tabel ke kontainer
  container.appendChild(table);

  // Tampilkan deskripsi warna setelah data standing ditampilkan
  const colorDescription = document.querySelector('.color-description');
  colorDescription.style.display = 'block';
  // Objek set untuk menyimpan jenis catatan yang sudah ditambahkan
  const addedNotes = new Set();
  // Tambahkan deskripsi warna berdasarkan data standing
  const legendList = document.getElementById('legendList');
  standings.forEach((teamStanding) => {
    const { note } = teamStanding;
    if (note && !addedNotes.has(note.description)) {
      const listItem = document.createElement('li');
      const colorBox = document.createElement('div');
      colorBox.classList.add('color-box');
      colorBox.style.backgroundColor = note.color;
      const description = document.createElement('p');
      description.textContent = note.description;
      listItem.appendChild(colorBox);
      listItem.appendChild(description);
      legendList.appendChild(listItem);

      // Tambahkan jenis catatan ke dalam set
      addedNotes.add(note.description);
    }
  });
  // Sisipkan deskripsi warna ke dalam kontainer jika ada deskripsi warna
  if (legendList.childNodes.length > 0) {
    colorDescription.appendChild(legendList);
  } else {
    colorDescription.style.display = 'none'; // Sembunyikan kontainer jika tidak ada deskripsi warna
  }
}

// Fungsi untuk mendapatkan nilai dari statistik tertentu
function getStatValue(stats, statName) {
  const stat = stats.find((stat) => stat.name === statName);
  return stat ? stat.value : ''; // Jika statistik ditemukan, kembalikan nilainya; jika tidak, kembalikan string kosong
}

// Fungsi untuk menampilkan klasemen ketika tombol di klik
$('#searchButton').click(function () {
  const leagueId = $('#leagueSelect').val();
  if (!leagueId) {
    return swal('', 'Mohon pilih liga terlebih dahulu', 'warning');
  }

  const apiUrl = `https://api-football-standings.azharimm.dev/leagues/${leagueId}/standings?season=2023&sort=asc`;

  swal({
    title: '',
    text: 'Mengambil data standings . . .',
    icon: 'https://c.tenor.com/I6kN-6X7nhAAAAAj/loading-buffering.gif',
    button: false,
  });

  $.ajax({
    url: apiUrl,
    method: 'GET',
    success: function (res) {
      const leagueName = res.data.name;
      const titleResult = document.querySelector('.title-result');

      titleResult.textContent = ` ${leagueName} Season 2023/2024`;

      displayStandings(
        document.querySelector('.standings-table'),
        res.data.standings
      );
      swal.close();
    },
    error: function (xhr, status, error) {
      console.error(error);
      swal('Error', 'Terjadi kesalahan saat mengambil data standings', 'error');
    },
  });
});
