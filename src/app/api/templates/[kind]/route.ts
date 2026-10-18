import { NextResponse } from "next/server";

const TEMPLATES: Record<string, { filename: string; content: string }> = {
  siswa: {
    filename: "template_impor_siswa.csv",
    content:
      "nisn,nama,rombel\n" +
      "0101306751,Andi Pratama,9A\n" +
      "0115115101,Bunga Citra Lestari,9A\n" +
      "0101306752,Cahyo Nugroho,8B\n" +
      "0115115102,Dewi Sartika,7A\n",
  },
  guru: {
    filename: "template_impor_guru.csv",
    content:
      "nip,nama,username\n" +
      '198501012010011001,"Budi Santoso, S.Pd.",198501012010011001\n' +
      '198803152015022002,"Siti Rahayu, M.Pd.",198803152015022002\n' +
      '2026001,"Ahmad Fauzi, S.Si.",guru_fauzi\n',
  },
  jadwal: {
    filename: "template_impor_jadwal.csv",
    content:
      "hari,jam_mulai,jam_selesai,rombel,mapel,guru,ruang\n" +
      "Senin,07:30,08:50,9A,Matematika,198501012010011001,Ruang 9A\n" +
      "Senin,09:05,10:25,9A,Bahasa Indonesia,2026001,Ruang 9A\n" +
      "Selasa,07:30,08:50,9B,Bahasa Inggris,2026001,Lab Bahasa\n" +
      "Rabu,08:00,09:20,8A,IPA,198501012010011001,Lab IPA\n" +
      "Kamis,07:30,08:50,7B,Pendidikan Agama,guru,Ruang 7B\n" +
      "Jumat,07:30,08:50,9A,PJOK,guru,Lapangan\n",
  },
  ortu: {
    filename: "template_impor_ortu.csv",
    content:
      "nama,anak_nisn,username,hubungan\n" +
      '"Bapak Pratama",0115300001,P0115300001,AYAH\n' +
      '"Ibu Lestari",0115300002,P0115300002,IBU\n' +
      '"Bapak Nugroho",0115300003,P0115300003,AYAH\n' +
      '"Ibu Sartika",0115300004,P0115300004,IBU\n' +
      '"Bapak Firmansyah",0115300005,P0115300005,AYAH\n',
  },
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ kind: string }> }
) {
  const { kind } = await params;
  const tpl = TEMPLATES[kind.toLowerCase()];

  if (!tpl) {
    return new NextResponse("Template tidak ditemukan. Pilihan: siswa, guru, jadwal", {
      status: 404,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  // Prepend UTF-8 BOM (\uFEFF) agar Microsoft Excel otomatis membaca CSV dengan encoding yang benar
  const csvWithBom = "\uFEFF" + tpl.content;

  return new NextResponse(csvWithBom, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${tpl.filename}"`,
      "Cache-Control": "no-cache",
    },
  });
}
