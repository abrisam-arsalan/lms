/** Kartu placeholder utk rute M1 yang kerangkanya sudah ada tapi fiturnya menyusul. */
export default function Soon({
  title,
  milestone,
  note,
}: {
  title: string;
  milestone: string;
  note: string;
}) {
  return (
    <>
      <div className="page-head">
        <h1>{title}</h1>
        <p className="muted">{note}</p>
      </div>
      <div className="card">
        <div className="card-body">
          <div className="empty">
            <div style={{ fontSize: 40, marginBottom: 8 }}>🚧</div>
            <p style={{ fontSize: 15, fontWeight: 700 }}>Halaman ini sedang dibangun</p>
            <p>
              Masuk milestone <span className="badge badge-blue">{milestone}</span>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
