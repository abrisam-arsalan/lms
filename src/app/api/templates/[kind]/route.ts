import { NextResponse } from "next/server";

const TEMPLATES: Record<string, { filename: string; content: string }> = {
  siswa: {
    filename: "template_impor_siswa.csv",
    content:
      "nis,nisn,nama,rombel\n" +
      "1001,0101306751,Andi Pratama,9A\n" +
      "1002,0115115101,Bunga Citra Lestari,9A\n" +
      "1003,0101306752,Cahyo Nugroho,8B\n" +
      "1004,0115115102,Dewi Sartika,7A\n",
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
