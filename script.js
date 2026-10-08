// === DATA ===
let saya = null;
let temanDipilih = null;
let halamanSaatIni = 'beranda';

// === FUNGSI BANTUAN ===
function buatID(){
  const k = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let id = 'USR';
  for(let i=0;i<6;i++) id += k[Math.floor(Math.random()*k.length)];
  return id;
}

function waktuSekarang(){
  const d = new Date();
  return d.toLocaleTimeString('id-ID', {hour:'2-digit', minute:'2-digit'});
}

function tampilPesan(teks){
  document.getElementById('teksPopup').textContent = teks;
  document.getElementById('popup').classList.add('tampil');
}
function tutupPopup(){
  document.getElementById('popup').classList.remove('tampil');
}

function simpanData(){
  localStorage.setItem('cplay_saya', JSON.stringify(saya));
}

function ambilData(){
  const data = localStorage.getItem('cplay_saya');
  if(data) saya = JSON.parse(data);
}

function daftarSemuaPengguna(){
  const semua = JSON.parse(localStorage.getItem('cplay_semua')||'{}');
  saya.terakhirDilihat = waktuSekarang();
  semua[saya.id] = {
    nama: saya.nama,
    online: saya.online,
    terakhirDilihat: saya.terakhirDilihat,
    permintaan: saya.permintaan,
    pesan: saya.pesan
  };
  localStorage.setItem('cplay_semua', JSON.stringify(semua));
}

// === MASUK ===
function masuk(){
  const nama = document.getElementById('namaPengguna').value.trim();
  if(!nama){
    tampilPesan('Masukkan nama terlebih dahulu!');
    return;
  }
  
  ambilData();
  if(!saya){
    saya = {
      id: buatID(),
      nama: nama,
      koin: 0,
      teman: [],
      permintaan: [],
      pesan: {},
      online: true,
      terakhirDilihat: waktuSekarang(),
      taskSelesai: {tambahTeman: false, kirimChat: false}
    };
    simpanData();
  } else {
    saya.nama = nama;
    saya.online = true;
    saya.terakhirDilihat = waktuSekarang();
    simpanData();
  }
  
  daftarSemuaPengguna();
  bukaAplikasi();
}

function bukaAplikasi(){
  document.getElementById('layarMasuk').classList.add('sembunyi');
  document.getElementById('aplikasi').classList.add('tampil');
  
  document.getElementById('namaMini').textContent = saya.nama;
  document.getElementById('namaProfil').textContent = saya.nama;
  document.getElementById('idSaya').textContent = saya.id;
  document.getElementById('ubahNama').value = saya.nama;
  updateKoin();
  renderDaftarTeman();
  renderPermintaan();
}

// === NAVIGASI HALAMAN ===
function bukaHalaman(nama){
  halamanSaatIni = nama;
  document.querySelectorAll('.menu-item').forEach(m=>m.classList.remove('aktif'));
  document.getElementById('menu'+nama.charAt(0).toUpperCase()+nama.slice(1)).classList.add('aktif');
  
  document.getElementById('halBeranda').classList.add('sembunyi');
  document.getElementById('halTeman').classList.add('sembunyi');
  document.getElementById('halTask').classList.add('sembunyi');
  document.getElementById('halNotif').classList.add('sembunyi');
  document.getElementById('halProfil').classList.add('sembunyi');
  
  document.getElementById('hal'+nama.charAt(0).toUpperCase()+nama.slice(1)).classList.remove('sembunyi');
  
  if(nama==='beranda' || nama==='teman') renderDaftarTeman();
  if(nama==='notif') renderPermintaan();
}

// === KOIN ===
function tambahKoin(jumlah){
  saya.koin += jumlah;
  simpanData();
  updateKoin();
}
function kurangiKoin(jumlah){
  if(saya.koin < jumlah) return false;
  saya.koin -= jumlah;
  simpanData();
  updateKoin();
  return true;
}
function updateKoin(){
  document.getElementById('koinMini').textContent = '🪙 ' + saya.koin;
  document.getElementById('koinProfil').textContent = '🪙 ' + saya.koin;
  document.getElementById('totalKoin').textContent = '🪙 ' + saya.koin;
}

// === TASK ===
function ambilHadiah(namaTask){
  if(saya.taskSelesai[namaTask]){
    tampilPesan('Hadiah sudah diambil hari ini!');
    return;
  }
  
  let syaratTerpenuhi = false;
  if(namaTask==='tambahTeman' && saya.teman.length>0) syaratTerpenuhi = true;
  if(namaTask==='kirimChat'){
    for(let id in saya.pesan){
      if(saya.pesan[id].length>0){
        syaratTerpenuhi = true;
        break;
      }
    }
  }
  
  if(!syaratTerpenuhi){
    tampilPesan('Selesaikan tugas terlebih dahulu!');
    return;
  }
  
  saya.taskSelesai[namaTask] = true;
  tambahKoin(5);
  tampilPesan('Berhasil! +5 Koin 🪙');
}

// === CARI TEMAN ===
function bukaModalCari(){
  document.getElementById('modalCari').classList.add('tampil');
  document.getElementById('inputCariId').value = '';
  document.getElementById('hasilCari').innerHTML = '<div class="tidak-ada">Masukkan ID untuk mencari</div>';
}
function tutupModalCari(){
  document.getElementById('modalCari').classList.remove('tampil');
}
function cariTeman(){
  const idCari = document.getElementById('inputCariId').value.trim();
  const kotak = document.getElementById('hasilCari');
  
  if(!idCari){
    kotak.innerHTML = '<div style="color:var(--merah)">Masukkan ID terlebih dahulu!</div>';
    return;
  }
  if(idCari === saya.id){
    kotak.innerHTML = '<div class="tidak-ada">Itu ID kamu sendiri!</div>';
    return;
  }
  
  const semua = JSON.parse(localStorage.getItem('cplay_semua')||'{}');
  if(semua[idCari]){
    const orang = semua[idCari];
    const sudahTeman = saya.teman.find(t=>t.id===idCari);
    const sudahKirim = orang.permintaan && orang.permintaan.find(p=>p.dari===saya.id);
    
    kotak.innerHTML = `
      <div class="item-hasil">
        <div class="foto-kecil">👤</div>
        <div class="info-hasil">
          <div class="nama-hasil">${orang.nama}</div>
          <div class="id-hasil">${idCari}</div>
        </div>
        ${sudahTeman ? '<span style="color:var(--hijau);font-size:13px">Sudah berteman</span>' :
          sudahKirim ? '<span style="color:var(--abu-teks);font-size:13px">Menunggu konfirmasi</span>' :
          `<button class="btn-kecil btn-biru" onclick="kirimPermintaan('${idCari}','${orang.nama}')">Tambah</button>`
        }
      </div>`;
  } else {
    kotak.innerHTML = '<div class="tidak-ada">ID tidak ditemukan. Tunggu temanmu masuk dulu ya!</div>';
  }
}
function kirimPermintaan(idTujuan, namaTujuan){
  const semua = JSON.parse(localStorage.getItem('cplay_semua')||'{}');
  if(!semua[idTujuan].permintaan) semua[idTujuan].permintaan = [];
  semua[idTujuan].permintaan.push({dari: saya.id, nama: saya.nama});
  localStorage.setItem('cplay_semua', JSON.stringify(semua));
  tampilPesan('Permintaan dikirim ke ' + namaTujuan + '!');
  tutupModalCari();
}

// === PERMINTAAN ===
function renderPermintaan(){
  const kotak = document.getElementById('daftarPermintaan');
  if(!saya.permintaan || saya.permintaan.length===0){
    kotak.innerHTML = '<div class="tidak-ada">Belum ada permintaan pertemanan.</div>';
    return;
  }
  kotak.innerHTML = saya.permintaan.map(p=>`
    <div class="item-permintaan">
      <div class="nama-permintaan"><b>${p.nama}</b> ingin berteman denganmu</div>
      <div class="aksi-permintaan">
        <button class="btn-kecil btn-hijau" onclick="terimaPermintaan('${p.dari}','${p.nama}')">Terima</button>
        <button class="btn-kecil btn-merah" onclick="tolakPermintaan('${p.dari}')">Tolak</button>
      </div>
    </div>`).join('');
}
function terimaPermintaan(idDari, namaDari){
  saya.permintaan = saya.permintaan.filter(p=>p.dari!==idDari);
  saya.teman.push({id: idDari, nama: namaDari});
  simpanData();
  tampilPesan('Berhasil berteman dengan ' + namaDari + '!');
  renderPermintaan();
  renderDaftarTeman();
}
function tolakPermintaan(idDari){
  saya.permintaan = saya.permintaan.filter(p=>p.dari!==idDari);
  simpanData();
  tampilPesan('Permintaan ditolak');
  renderPermintaan();
}

// === DAFTAR TEMAN ===
function renderDaftarTeman(){
  const kotak = document.getElementById('daftarTeman');
  const kotak2 = document.getElementById('daftarTeman2');
  
  if(!saya.teman || saya.teman.length===0){
    const kosong = '<div class="tidak-ada">Belum ada teman. Cari ID teman untuk menambahkan.</div>';
    kotak.innerHTML = kosong;
    if(kotak2) kotak2.innerHTML = kosong;
    return;
  }
  
  const semua = JSON.parse(localStorage.getItem('cplay_semua')||'{}');
  
  let html = saya.teman.map(t=>{
    const dataTeman = semua[t.id];
    const online = dataTeman ? dataTeman.online : false;
    const terakhir = dataTeman ? dataTeman.terakhirDilihat : '-';
    
    return `
      <div class="item-teman" onclick="bukaChat('${t.id}','${t.nama}')">
        <div class="foto-item">
          👤
          <span class="titik-status ${online?'online':'offline'}"></span>
        </div>
        <div class="info-teman">
          <div class="nama-teman">${t.nama}</div>
          <div class="status-teman">${online ? 'Online' : 'Offline'}</div>
          <div class="waktu-terakhir">Terakhir dilihat: ${terakhir}</div>
        </div>
      </div>`;
  }).join('');
  
  kotak.innerHTML = html;
  if(kotak2) kotak2.innerHTML = html;
}

// === CHAT ===
function bukaChat(id, nama){
  temanDipilih = {id, nama};
  
  const semua = JSON.parse(localStorage.getItem('cplay_semua')||'{}');
  const dataTeman = semua[id];
  const online = dataTeman ? dataTeman.online : false;
  const terakhir = dataTeman ? dataTeman.terakhirDilihat : '-';
  
  document.getElementById('chatKosong').style.display = 'none';
  document.getElementById('chatHeader').classList.remove('sembunyi');
  document.getElementById('areaPesan').style.display = 'block';
  document.getElementById('barInput').style.display = 'flex';
  document.getElementById('namaChat').textContent = nama;
  document.getElementById('statusChat').textContent = online ? 'Online' : 'Terakhir dilihat: ' + terakhir;
  
  if(!saya.pesan[id]) saya.pesan[id] = [];
  renderPesan();
  
  if(window.innerWidth<=768){
    document.getElementById('panelChat').classList.add('buka');
  }
}
function tutupChat(){
  temanDipilih = null;
  document.getElementById('chatKosong').style.display = 'flex';
  document.getElementById('chatHeader').classList.add('sembunyi');
  document.getElementById('areaPesan').style.display = 'none';
  document.getElementById('barInput').style.display = 'none';
  document.getElementById('panelChat').classList.remove('buka');
}
function renderPesan(){
  const area = document.getElementById('areaPesan');
  if(!saya.pesan[temanDipilih.id] || saya.pesan[temanDipilih.id].length===0){
    area.innerHTML = '<div class="tidak-ada">Mulai obrolan dengan ' + temanDipilih.nama + '</div>';
    return;
  }
  
  area.innerHTML = saya.pesan[temanDipilih.id].map(p=>`
    <div class="baris-pesan ${p.dari===saya.id?'pesan-kanan':'pesan-kiri'}">
      <div>
        <div class="bubble-pesan">${p.teks}</div>
        <div class="waktu-pesan">${p.waktu}</div>
      </div>
    </div>`).join('');
  area.scrollTop = area.scrollHeight;
}
function kirimPesan(){
  const input = document.getElementById('inputPesan');
  const teks = input.value.trim();
  if(!teks || !temanDipilih) return;
  
  if(!saya.pesan[temanDipilih.id]) saya.pesan[temanDipilih.id] = [];
  saya.pesan[temanDipilih.id].push({
    dari: saya.id,
    teks: teks,
    waktu: waktuSekarang()
  });
  simpanData();
  
  const semua = JSON.parse(localStorage.getItem('cplay_semua')||'{}');
  if(semua[temanDipilih.id]){
    if(!semua[temanDipilih.id].pesan[saya.id]) semua[temanDipilih.id].pesan[saya.id] = [];
    semua[temanDipilih.id].pesan[saya.id].push({
      dari: saya.id,
      nama: saya.nama,
      teks: teks,
      waktu: waktuSekarang()
    });
    localStorage.setItem('cplay_semua', JSON.stringify(semua));
  }
  
  input.value = '';
  renderPesan();
}

// === MODAL HADIAH ===
function bukaModalHadiah(){
  if(!temanDipilih){
    tampilPesan('Pilih teman terlebih dahulu!');
    return;
  }
  document.getElementById('modalHadiah').classList.add('tampil');
}
function tutupModalHadiah(){
  document.getElementById('modalHadiah').classList.remove('tampil');
}
function kirimHadiah(namaHadiah, harga){
  if(!temanDipilih) return;
  
  if(saya.koin < harga){
    tampilPesan('Koin tidak cukup! 🪙');
    return;
  }
  
  kurangiKoin(harga);
  
  if(!saya.pesan[temanDipilih.id]) saya.pesan[temanDipilih.id] = [];
  saya.pesan[temanDipilih.id].push({
    dari: saya.id,
    teks: '🎁 Mengirimkan ' + namaHadiah,
    waktu: waktuSekarang()
  });
  simpanData();
  
  const semua = JSON.parse(localStorage.getItem('cplay_semua')||'{}');
  if(semua[temanDipilih.id]){
    if(!semua[temanDipilih.id].pesan[saya.id]) semua[temanDipilih.id].pesan[saya.id] = [];
    semua[temanDipilih.id].pesan[saya.id].push({
      dari: saya.id,
      nama: saya.nama,
      teks: '🎁 ' + saya.nama + ' mengirimkan ' + namaHadiah,
      waktu: waktuSekarang()
    });
    localStorage.setItem('cplay_semua', JSON.stringify(semua));
  }
  
  tutupModalHadiah();
  renderPesan();
  tampilPesan('Berhasil mengirim ' + namaHadiah + '!');
}

// === PROFIL ===
function simpanNama(){
  const namaBaru = document.getElementById('ubahNama').value.trim();
  if(!namaBaru){
    tampilPesan('Nama tidak boleh kosong!');
    return;
  }
  saya.nama = namaBaru;
  simpanData();
  daftarSemuaPengguna();
  document.getElementById('namaMini').textContent = namaBaru;
  document.getElementById('namaProfil').textContent = namaBaru;
  tampilPesan('Nama berhasil diubah!');
}
function salinId(){
  navigator.clipboard.writeText(saya.id).then(()=>{
    tampilPesan('ID berhasil disalin!');
  });
}

// === UPDATE STATUS ONLINE ===
setInterval(()=>{
  if(saya){
    saya.terakhirDilihat = waktuSekarang();
    daftarSemuaPengguna();
    renderDaftarTeman();
  }
}, 5000);

window.addEventListener('beforeunload', ()=>{
  if(saya){
    saya.online = false;
    saya.terakhirDilihat = waktuSekarang();
    daftarSemuaPengguna();
  }
});
    
