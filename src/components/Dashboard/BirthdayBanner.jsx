import { useEffect, useState, useMemo } from "react";
import { useSelector } from "react-redux";
import { selectActiveInfantsOrderedByLastName } from "../../redux/selectors";
import { capitalizeName } from "../../utils";

const calculateNewAge = (birthdate) => {
  const today = new Date();
  const birthDate = new Date(birthdate);
  return today.getFullYear() - birthDate.getFullYear();
};

const getDayName = (date) =>
  new Intl.DateTimeFormat("es-ES", { weekday: "long" }).format(date);

const isSameDayAndMonth = (date1, date2) =>
  date1.getDate() === date2.getDate() &&
  date1.getMonth() === date2.getMonth();

const getDateWithoutYear = (dateString) => {
  const [, month, day] = dateString.split("T")[0].split("-");
  const currentYear = new Date().getFullYear();
  return new Date(currentYear, parseInt(month) - 1, parseInt(day));
};

export default function BirthdayBanner() {
  const infants = useSelector(selectActiveInfantsOrderedByLastName);
  const [activeIndex, setActiveIndex] = useState(0);

  const birthdayCategories = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const previousDates = [];
    if (today.getDay() === 1) {
      const saturday = new Date(today);
      saturday.setDate(today.getDate() - 2);
      const sunday = new Date(today);
      sunday.setDate(today.getDate() - 1);
      previousDates.push(saturday, sunday);
    } else {
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);
      const twoDaysAgo = new Date(today);
      twoDaysAgo.setDate(today.getDate() - 2);
      previousDates.push(yesterday, twoDaysAgo);
    }

    const previous = [];
    const todayList = [];
    const tomorrowList = [];

    infants.forEach((infant) => {
      if (!infant.birthdate) return;
      const birthdateThisYear = getDateWithoutYear(infant.birthdate);
      const age = calculateNewAge(infant.birthdate);
      const infantData = { ...infant, age };

      if (isSameDayAndMonth(birthdateThisYear, today)) {
        todayList.push(infantData);
      } else if (isSameDayAndMonth(birthdateThisYear, tomorrow)) {
        tomorrowList.push(infantData);
      } else {
        const matchedDate = previousDates.find((prevDate) =>
          isSameDayAndMonth(birthdateThisYear, prevDate)
        );
        if (matchedDate) {
          previous.push({
            ...infantData,
            dayName: getDayName(matchedDate),
            formattedDate: matchedDate.toISOString().slice(5, 10),
          });
        }
      }
    });

    return { previous, todayList, tomorrowList };
  }, [infants]);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % 3);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const hasAnyBirthdays =
    birthdayCategories.previous.length > 0 ||
    birthdayCategories.todayList.length > 0 ||
    birthdayCategories.tomorrowList.length > 0;

  if (!hasAnyBirthdays) return null;

  return (
    <div className="luceritos-birthday-container">
      <div className={`luceritos-birthday-card previous ${activeIndex === 0 ? "hovered" : ""}`}>
        <h2>Cumpleaños Recientes</h2>
        {birthdayCategories.previous.length > 0 ? (
          <ul>
            {birthdayCategories.previous.map((infant) => (
              <li key={infant.id}>
                {capitalizeName(infant.first_name)}{" "}
                {capitalizeName(infant.lastname)} — Cumplió {infant.age} años
                <br />
                <small>(Día: {infant.dayName}, {infant.formattedDate})</small>
              </li>
            ))}
          </ul>
        ) : (
          <p>No hubo cumpleaños recientes.</p>
        )}
      </div>

      <div className={`luceritos-birthday-card today ${activeIndex === 1 ? "hovered" : ""}`}>
        <h2>¡Cumpleaños de Hoy!</h2>
        {birthdayCategories.todayList.length > 0 ? (
          <ul>
            {birthdayCategories.todayList.map((infant) => (
              <li key={infant.id}>
                {capitalizeName(infant.first_name)}{" "}
                {capitalizeName(infant.lastname)} — Cumple {infant.age} años
              </li>
            ))}
          </ul>
        ) : (
          <p>No hay cumpleaños hoy.</p>
        )}
      </div>

      <div className={`luceritos-birthday-card next ${activeIndex === 2 ? "hovered" : ""}`}>
        <h2>Cumpleaños de Mañana</h2>
        {birthdayCategories.tomorrowList.length > 0 ? (
          <ul>
            {birthdayCategories.tomorrowList.map((infant) => (
              <li key={infant.id}>
                {capitalizeName(infant.first_name)}{" "}
                {capitalizeName(infant.lastname)} — Cumple {infant.age} años
              </li>
            ))}
          </ul>
        ) : (
          <p>No hay cumpleaños mañana.</p>
        )}
      </div>
    </div>
  );
}
