import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { I18nProvider, useTranslation } from "@/lib/i18n";

function TestConsumer() {
  const { locale, setLocale, t } = useTranslation();

  return (
    <>
      <p>{t("nav.home")}</p>
      <button type="button" onClick={() => setLocale("es")}>
        switch-language
      </button>
      <span>{locale}</span>
    </>
  );
}

describe("i18n", () => {
  it("switches the UI to Spanish and uses Spanish translations", () => {
    render(
      <I18nProvider>
        <TestConsumer />
      </I18nProvider>,
    );

    expect(screen.getByText("Home")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "switch-language" }));

    expect(screen.getByText("Inicio")).toBeInTheDocument();
    expect(screen.getByText("es")).toBeInTheDocument();
  });
});
