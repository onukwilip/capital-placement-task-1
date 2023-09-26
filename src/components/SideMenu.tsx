import React from "react";
import css from "../styles/SideMenu.module.scss";

const icons: string[] = [
  "fas fa-home",
  "fas fa-users",
  "fa-regular fa-calendar",
  "fa-solid fa-share-nodes",
  "fa-solid fa-caret-left",
];

const SideMenu = () => {
  return (
    <div className={css.side_menu}>
      <div className={css.menu}>
        {icons.map((icon, i) => (
          <i className={icon} key={i}></i>
        ))}
      </div>
      <i className="fa-solid fa-gear"></i>
    </div>
  );
};

export default SideMenu;
