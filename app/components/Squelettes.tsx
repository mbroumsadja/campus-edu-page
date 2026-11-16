export default function Squelettes({ vue }: { vue: "grille" | "liste" }) {
  return (
    <ul className={vue === "grille" ? "tiles" : "rows"} aria-hidden="true">
      {Array.from({ length: 6 }, (_, i) => (
        <li key={i} className={vue === "grille" ? "tile tile--sk" : "row row--sk"}>
          <span className="sk sk-a" />
          <span className="sk sk-b" />
          <span className="sk sk-c" />
        </li>
      ))}
    </ul>
  );
}
