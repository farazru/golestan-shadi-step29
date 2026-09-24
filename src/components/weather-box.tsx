"use client";

import { useEffect, useState } from "react";

export function WeatherBox() {
  const [temp, setTemp] = useState<string>("—");
  const [hum, setHum] = useState<string>("—");

  useEffect(() => {
    fetch(
      "https://api.open-meteo.com/v1/forecast?latitude=38.08&longitude=46.29&current=temperature_2m,relative_humidity_2m",
    )
      .then((r) => r.json())
      .then((d) => {
        if (d?.current?.temperature_2m != null) setTemp(String(d.current.temperature_2m));
        if (d?.current?.relative_humidity_2m != null) setHum(String(d.current.relative_humidity_2m));
      })
      .catch(() => null);
  }, []);

  return (
    <section className="school-card-ink rounded-3xl p-5">
      <h2 className="mb-4 text-lg font-semibold">وضعیت آب و هوا · سهند</h2>
      <p className="flex justify-between text-sm">
        <span>دما</span>
        <span>{temp} °C</span>
      </p>
      <p className="mt-2 flex justify-between text-sm">
        <span>رطوبت</span>
        <span>{hum} درصد</span>
      </p>
    </section>
  );
}
