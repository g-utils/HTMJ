class HTMJ {
  // Constants for repeated strings
  static ATTR_PREFIX = "hx-";
  static ENDPOINT = `${HTMJ.ATTR_PREFIX}endpoint`;
  static DATA_SOURCES = `${HTMJ.ATTR_PREFIX}data-sources`;
  static METHOD = `${HTMJ.ATTR_PREFIX}method`;
  static EVENT = `${HTMJ.ATTR_PREFIX}event`;
  static ERROR = `${HTMJ.ATTR_PREFIX}error`;
  static TARGET = `${HTMJ.ATTR_PREFIX}target`;
  static EVENT_TARGET = `${HTMJ.ATTR_PREFIX}event-target`;
  static ACTION = `${HTMJ.ATTR_PREFIX}action`;

  constructor() {
    this.init();
  }

  init() {
    document.addEventListener("DOMContentLoaded", () => this.parseTemplates());
  }

  parseTemplates() {
    const templates = document.querySelectorAll(`template[${HTMJ.ENDPOINT}]`);

    templates.forEach((template) => {
      const endpoint = template.getAttribute(HTMJ.ENDPOINT);
      const dataSources = template.getAttribute(HTMJ.DATA_SOURCES);
      const method = this.getMethod(template, dataSources);
      const event = template.getAttribute(HTMJ.EVENT) ?? "onload";
      const errorFuncName = template.getAttribute(HTMJ.ERROR);
      const target = this.getTarget(template);
      const eventTarget = this.getEventTarget(template, target);

      this.bindEvent(event, eventTarget, async (e) => {
        e?.preventDefault();
        const data = await this.fetchData(endpoint, method, dataSources);
        data.error && errorFuncName
          ? window[errorFuncName]?.(data.error)
          : this.renderTemplate(template, data, target);
      });
    });
  }

  // Consistency in Nullish Coalescing
  getMethod(template, dataSources) {
    return template.getAttribute(HTMJ.METHOD) ?? (dataSources ? "POST" : "GET");
  }

  getTarget(template) {
    const targetSelector = template.getAttribute(HTMJ.TARGET);
    return document.querySelector(targetSelector) ?? template.parentNode;
  }

  getEventTarget(template, defaultTarget) {
    const eventTargetSelector = template.getAttribute(HTMJ.EVENT_TARGET);
    return document.querySelector(eventTargetSelector) ?? defaultTarget;
  }

  bindEvent(event, eventTarget, handler) {
    event === "onload"
      ? handler()
      : eventTarget.addEventListener(event.slice(2), handler);
  }

  async fetchData(endpoint, method, dataSources) {
    try {
      const dataToSend = this.prepareData(dataSources);
      const options = {
        method,
        headers: { "Content-Type": "application/json" },
        body:
          method !== "GET" && dataToSend
            ? JSON.stringify(dataToSend)
            : undefined,
      };

      const response = await fetch(endpoint, options);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "An error occurred");
      }

      return data;
    } catch (error) {
      console.error("Failed to fetch data:", error);
      return { error: error.message };
    }
  }

  prepareData(dataSources) {
    if (!dataSources) return null;

    const sources = dataSources.split(",").map((src) => src.trim());
    const elements = sources.map((src) => document.querySelector(src));

    return sources.reduce((dataToSend, src, index) => {
      const element = elements[index];
      if (element) {
        const key = src.startsWith("#") ? src.slice(1) : src;
        dataToSend[key] = element.value ?? element.innerText;
      }
      return dataToSend;
    }, {});
  }

  renderTemplate(template, data, target) {
    const fragment = document.createDocumentFragment();
    const renderData = (item) => {
      const clone = document.importNode(template.content, true);
      this.renderNode(clone, item);
      fragment.appendChild(clone);
    };

    Array.isArray(data) ? data.forEach(renderData) : renderData(data);

    const action = template.getAttribute(HTMJ.ACTION) ?? "update";
    this.applyAction(action, target, fragment);
  }

  renderNode(node, data) {
    node.querySelectorAll("*").forEach((childNode) => {
      if (childNode.hasAttribute("data-nested-array")) {
        this.handleNestedArray(childNode, data);
      } else {
        this.replaceTextContent(childNode, data);
      }
    });
  }

  handleNestedArray(childNode, data) {
    const nestedKey = childNode.getAttribute("data-nested-array");
    const nestedData = data[nestedKey];
    if (Array.isArray(nestedData)) {
      const container = document.createElement("div");
      nestedData.forEach((nestedItem) => {
        const nestedClone = document.importNode(childNode, true);
        this.renderNode(nestedClone, nestedItem);
        container.appendChild(nestedClone);
      });
      childNode.parentNode.replaceChild(container, childNode);
    }
  }

  replaceTextContent(childNode, data) {
    Array.from(childNode.childNodes).forEach((textNode) => {
      if (textNode.nodeType === Node.TEXT_NODE) {
        textNode.nodeValue = textNode.nodeValue.replace(
          /\$\{([^}]+)\}/g,
          (_, key) => this.deepAccess(data, key) || "",
        );
      }
    });
  }

  deepAccess(obj, path) {
    return path.split(".").reduce((acc, part) => acc?.[part], obj);
  }

  // Avoid using innerHTML for security reasons
  applyAction(action, target, fragment) {
    switch (action) {
      case "append":
        target.appendChild(fragment);
        break;
      case "swap":
        target.replaceWith(fragment);
        break;
      case "update":
      default:
        while (target.firstChild) {
          target.removeChild(target.firstChild);
        }
        target.appendChild(fragment);
        break;
    }
  }
}

new HTMJ();
