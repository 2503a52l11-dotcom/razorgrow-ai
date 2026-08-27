import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Boxes,
  BrainCircuit,
  CircleDollarSign,
  Package,
  PackagePlus,
  RefreshCw,
  ShoppingCart,
  Sparkles,
  Store,
  TrendingUp,
  Users,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
} from "lucide-react";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

// ============================================================
// CONFIGURATION
// ============================================================

const API_URL = "http://127.0.0.1:8000";

const MERCHANT_ID =
  "f9105f04-7541-43ef-ab20-67f30a41cd9c";


// ============================================================
// AXIOS INSTANCE
// ============================================================

const api = axios.create({
  baseURL: API_URL,
  timeout: 60000,
});


// ============================================================
// MAIN APP
// ============================================================

function App() {
  // ----------------------------------------------------------
  // DASHBOARD DATA
  // ----------------------------------------------------------

  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [lastUpdated, setLastUpdated] = useState(null);


  // ----------------------------------------------------------
  // ANALYTICS DATA
  // ----------------------------------------------------------

  const [dailyRevenue, setDailyRevenue] = useState([]);

  const [analyticsLoading, setAnalyticsLoading] =
    useState(true);

  const [analyticsError, setAnalyticsError] =
    useState("");


  // ----------------------------------------------------------
  // AI
  // ----------------------------------------------------------

  const [aiRecommendation, setAiRecommendation] =
    useState("");

  const [aiLoading, setAiLoading] =
    useState(false);

  const [aiError, setAiError] =
    useState("");


  // ----------------------------------------------------------
  // ADD PRODUCT
  // ----------------------------------------------------------

  const [showAddProduct, setShowAddProduct] =
    useState(false);

  const [productSaving, setProductSaving] =
    useState(false);

  const [productError, setProductError] =
    useState("");

  const [productSuccess, setProductSuccess] =
    useState("");

  const [productForm, setProductForm] =
    useState({
      name: "",
      description: "",
      category: "",
      price: "",
      currency: "INR",
      stock: "",
    });


  // ----------------------------------------------------------
  // CREATE ORDER
  // ----------------------------------------------------------

  const [showCreateOrder, setShowCreateOrder] =
    useState(false);

  const [orderSaving, setOrderSaving] =
    useState(false);

  const [orderError, setOrderError] =
    useState("");

  const [orderSuccess, setOrderSuccess] =
    useState("");

  const [orderForm, setOrderForm] =
    useState({
      product_id: "",
      quantity: 1,
    });


  // ============================================================
  // LOAD PRODUCTS + ORDERS
  // ============================================================

  const loadDashboard = async () => {
    setLoading(true);
    setError("");

    try {
      const [
        productsResponse,
        ordersResponse,
      ] = await Promise.all([
        api.get("/api/v1/products", {
          params: {
            merchant_id: MERCHANT_ID,
          },
        }),

        api.get("/api/v1/orders", {
          params: {
            merchant_id: MERCHANT_ID,
          },
        }),
      ]);


      const productsData =
        Array.isArray(productsResponse.data)
          ? productsResponse.data
          : [];


      const ordersData =
        Array.isArray(ordersResponse.data)
          ? ordersResponse.data
          : [];


      setProducts(productsData);
      setOrders(ordersData);

      setLastUpdated(new Date());

    } catch (err) {
      console.error(
        "Dashboard loading error:",
        err
      );

      setError(
        "Could not connect to the RazorGrow backend. Make sure FastAPI is running on port 8000."
      );

    } finally {
      setLoading(false);
    }
  };


  // ============================================================
  // LOAD DAILY REVENUE
  // ============================================================

  const loadDailyRevenue = async () => {
    setAnalyticsLoading(true);
    setAnalyticsError("");

    try {
      console.log(
        "Loading daily revenue..."
      );


      const response = await api.get(
        "/api/v1/analytics/daily-revenue",
        {
          params: {
            merchant_id: MERCHANT_ID,
          },
        }
      );


      console.log(
        "Daily revenue API response:",
        response.data
      );


      let data = response.data;


      // --------------------------------------------------------
      // Handle different possible API response formats
      // --------------------------------------------------------

      if (
        data &&
        !Array.isArray(data) &&
        Array.isArray(data.data)
      ) {
        data = data.data;
      }


      if (
        data &&
        !Array.isArray(data) &&
        Array.isArray(data.results)
      ) {
        data = data.results;
      }


      if (!Array.isArray(data)) {
        throw new Error(
          "Daily revenue API did not return an array."
        );
      }


      // --------------------------------------------------------
      // Normalize API data
      // --------------------------------------------------------

      const normalizedData =
        data
          .map((item) => {
            const rawDate =
              item?.date ??
              item?.day ??
              item?.created_at ??
              "";


            const rawRevenue =
              item?.revenue ??
              item?.total_revenue ??
              item?.total_amount ??
              0;


            const rawOrders =
              item?.orders ??
              item?.total_orders ??
              item?.order_count ??
              0;


            const revenue =
              Number(rawRevenue);


            const orders =
              Number(rawOrders);


            return {
              date: String(rawDate),
              revenue:
                Number.isFinite(revenue)
                  ? revenue
                  : 0,
              orders:
                Number.isFinite(orders)
                  ? orders
                  : 0,
            };
          })
          .filter(
            (item) =>
              item.date &&
              (
                item.revenue !== 0 ||
                item.orders !== 0
              )
          );


      console.log(
        "Normalized chart data:",
        normalizedData
      );


      setDailyRevenue(
        normalizedData
      );

    } catch (err) {
      console.error(
        "Daily revenue error:",
        err
      );


      setDailyRevenue([]);


      if (
        err?.response?.status === 404
      ) {
        setAnalyticsError(
          "Daily revenue endpoint was not found. Check that /api/v1/analytics/daily-revenue exists in FastAPI."
        );
      } else {
        setAnalyticsError(
          "Could not load daily revenue data."
        );
      }

    } finally {
      setAnalyticsLoading(false);
    }
  };


  // ============================================================
  // LOAD AI RECOMMENDATION
  // ============================================================

  const loadAIRecommendation = async () => {
    setAiLoading(true);
    setAiError("");

    try {
      console.log("========================================");
      console.log("Loading AI recommendation...");
      console.log("Merchant ID:", MERCHANT_ID);
      console.log("Endpoint:", "/api/v1/ai/recommendations");
      console.log("========================================");

      const response = await api.get(
        "/api/v1/ai/recommendations",
        {
          params: {
            merchant_id: MERCHANT_ID,
          },
          timeout: 60000,
        }
      );

      console.log("AI recommendation API response:", response.data);

      const data = response.data;

      let recommendation = "";

      if (typeof data === "string") {
        recommendation = data;
      } else if (data && typeof data === "object") {
        recommendation =
          data.recommendation ??
          data.text ??
          data.content ??
          "";
      }

      recommendation = String(recommendation || "").trim();

      console.log("Final AI recommendation:", recommendation);

      if (!recommendation) {
        throw new Error("The AI endpoint returned an empty recommendation.");
      }

      setAiRecommendation(recommendation);
    } catch (err) {
      console.error("AI recommendation error:", err);
      console.error("AI error response:", err?.response?.data);
      console.error("AI error status:", err?.response?.status);

      setAiRecommendation("");

      if (err?.code === "ECONNABORTED" || err?.code === "ETIMEDOUT") {
        setAiError(
          "Qwen3 took too long to respond. Make sure Ollama is running and try Generate again."
        );
      } else if (err?.response?.status === 404) {
        setAiError(
          "AI endpoint was not found. Make sure FastAPI has /api/v1/ai/recommendations."
        );
      } else if (err?.response?.status >= 500) {
        setAiError(
          "FastAPI returned a server error while generating the AI recommendation."
        );
      } else if (!err?.response) {
        setAiError(
          "Could not connect to the FastAPI AI service. Make sure FastAPI and Ollama are running."
        );
      } else {
        setAiError(
          "Could not load the AI recommendation. Check FastAPI and Ollama."
        );
      }
    } finally {
      setAiLoading(false);
    }
  };


// ============================================================
// AI RECOMMENDATION COMPONENT
// ============================================================

function renderAIRecommendation({ text }) {
  if (!text) {
    return (
      <div className="ai-empty">
        No recommendation was returned.
      </div>
    );
  }

  let cleanedText = String(text)
    .replace(/\r\n/g, "\n")
    .replace(/\*\*/g, "")
    .replace(/\(\s*\d+\s+words?\s*\)/gi, "")
    .replace(/Word count\s*:\s*\d+/gi, "")
    .replace(/\(\s*Word count\s*:\s*\d+\s*\)/gi, "")
    .trim();

  const recommendations = cleanedText
    .split(/(?=\b\d+\.\s+)/)
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => item.replace(/^\d+\.\s*/, "").trim())
    .filter((item) => {
      const useful = item.replace(/[\s*_\-:.;]+/g, "");
      return useful.length > 2;
    });

  if (recommendations.length === 0) {
    return (
      <div className="ai-empty">
        No recommendation content was returned.
      </div>
    );
  }

  return (
    <div className="ai-recommendations-list row g-3">
      {recommendations.map((item, index) => {
        let recommendationText = item
          .replace(/\*\*/g, "")
          .replace(/^[-*•_\s]+/, "")
          .trim();

        if (!recommendationText) {
          return null;
        }

        let title = "";
        let description = recommendationText;

        const colonIndex = recommendationText.indexOf(":");

        if (colonIndex > 0 && colonIndex < 80) {
          title = recommendationText.slice(0, colonIndex).trim();
          description = recommendationText.slice(colonIndex + 1).trim();
        }

        title = title
          .replace(/\*\*/g, "")
          .replace(/^[-*•_\s]+/, "")
          .trim();

        description = description
          .replace(/\*\*/g, "")
          .replace(/^[-*•_\s]+/, "")
          .trim();

        if (
          !title &&
          (!description ||
            description === "*" ||
            description === "**" ||
            description === "-")
        ) {
          return null;
        }

        return (
          <div
            className="col-12 col-md-6"
            key={`ai-recommendation-${index}`}
          >
            <div
              className="ai-recommendation-item h-100 d-flex align-items-start gap-3"
              style={{
                padding: "18px",
                borderRadius: "14px",
                border: "1px solid rgba(255,255,255,0.14)",
                background: "rgba(255,255,255,0.07)",
                minHeight: "110px",
              }}
            >
              <div
                className="ai-number d-flex align-items-center justify-content-center flex-shrink-0"
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "10px",
                  background: "rgba(255,255,255,0.14)",
                  color: "#ffffff",
                  fontWeight: 800,
                  fontSize: "14px",
                }}
              >
                {index + 1}
              </div>

              <div
                className="ai-recommendation-content flex-grow-1"
                style={{ minWidth: 0 }}
              >
                {title && (
                  <div
                    className="ai-recommendation-title fw-bold mb-2"
                    style={{
                      color: "#ffffff",
                      lineHeight: 1.4,
                      fontSize: "15px",
                    }}
                  >
                    {title}
                  </div>
                )}

                <div
                  className="ai-recommendation-description"
                  style={{
                    color: "rgba(255,255,255,0.80)",
                    lineHeight: 1.65,
                    fontSize: "13px",
                  }}
                >
                  {description}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

  // ============================================================
  // REFRESH EVERYTHING
  // ============================================================

  const refreshAll = async () => {
    await Promise.all([
      loadDashboard(),
      loadDailyRevenue(),
      loadAIRecommendation(),
    ]);
  };


  // ============================================================
  // INITIAL LOAD
  // ============================================================

  useEffect(() => {
    const refreshTimer = window.setTimeout(() => {
      void refreshAll();
    }, 0);

    return () => window.clearTimeout(refreshTimer);
  }, []);


  // ============================================================
  // STATISTICS
  // ============================================================

  const statistics = useMemo(() => {
    const totalSales =
      orders.reduce(
        (sum, order) => {
          return (
            sum +
            Number(
              order?.total_amount || 0
            )
          );
        },
        0
      );


    const totalOrders =
      orders.length;


    const totalProducts =
      products.length;


    const totalStock =
      products.reduce(
        (sum, product) => {
          return (
            sum +
            Number(
              product?.stock || 0
            )
          );
        },
        0
      );


    const completedOrders =
      orders.filter(
        (order) =>
          order?.status ===
          "completed"
      ).length;


    const averageOrderValue =
      totalOrders > 0
        ? totalSales / totalOrders
        : 0;


    const unitsSold =
      orders.reduce(
        (sum, order) => {
          return (
            sum +
            Number(
              order?.quantity || 0
            )
          );
        },
        0
      );


    return {
      totalSales,
      totalOrders,
      totalProducts,
      totalStock,
      completedOrders,
      averageOrderValue,
      unitsSold,
    };

  }, [
    products,
    orders,
  ]);


  // ============================================================
  // CHART DATA
  // ============================================================

  const chartData = useMemo(() => {

    if (
      !Array.isArray(dailyRevenue)
    ) {
      return [];
    }


    return dailyRevenue.map(
      (item) => {

        const rawDate =
          String(
            item?.date || ""
          );


        let displayDate =
          rawDate;


        // ------------------------------------------------------
        // Convert YYYY-MM-DD into readable date
        // ------------------------------------------------------

        if (
          /^\d{4}-\d{2}-\d{2}$/.test(
            rawDate
          )
        ) {
          const date =
            new Date(
              `${rawDate}T00:00:00`
            );


          if (
            !Number.isNaN(
              date.getTime()
            )
          ) {
            displayDate =
              date.toLocaleDateString(
                "en-IN",
                {
                  day: "2-digit",
                  month: "short",
                }
              );
          }
        }


        return {
          date: rawDate,

          displayDate,

          revenue:
            Number(
              item?.revenue || 0
            ),

          orders:
            Number(
              item?.orders || 0
            ),
        };
      }
    );

  }, [
    dailyRevenue,
  ]);


  // ============================================================
  // PRODUCT LIST
  // ============================================================

  const topProducts = useMemo(() => {

    return [...products]
      .sort(
        (a, b) =>
          Number(
            b?.stock || 0
          ) -
          Number(
            a?.stock || 0
          )
      )
      .slice(0, 10);

  }, [
    products,
  ]);

  // ------------------------------------------------------------
  // LOW STOCK ALERTS
  // ------------------------------------------------------------

  // Uses the products already loaded by loadDashboard().
  // No additional API request is required.
  const lowStockProducts = useMemo(() => {

    return [...products]
      .filter(
        (product) =>
          Number(product?.stock || 0) <= 20
      )
      .sort(
        (a, b) =>
          Number(a?.stock || 0) -
          Number(b?.stock || 0)
      );

  }, [
    products,
  ]);


  // ============================================================
  // RECENT ORDERS
  // ============================================================

  const recentOrders = useMemo(() => {

    return [...orders]
      .sort(
        (a, b) =>
          new Date(
            b?.created_at || 0
          ) -
          new Date(
            a?.created_at || 0
          )
      )
      .slice(0, 10);

  }, [
    orders,
  ]);


  // ============================================================
  // FORMAT CURRENCY
  // ============================================================

  const formatCurrency = (
    value
  ) => {

    const number =
      Number(value || 0);


    return new Intl.NumberFormat(
      "en-IN",
      {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 2,
      }
    ).format(number);
  };


  // ============================================================
  // FORMAT DATE
  // ============================================================

  const formatDate = (
    date
  ) => {

    if (!date) {
      return "-";
    }


    const parsed =
      new Date(date);


    if (
      Number.isNaN(
        parsed.getTime()
      )
    ) {
      return "-";
    }


    return parsed.toLocaleString(
      "en-IN",
      {
        dateStyle: "medium",
        timeStyle: "short",
      }
    );
  };


  // ============================================================
  // PRODUCT FORM
  // ============================================================

  const handleProductFormChange =
    (event) => {

      const {
        name,
        value,
      } = event.target;


      setProductForm(
        (current) => ({
          ...current,
          [name]: value,
        })
      );


      setProductError("");
      setProductSuccess("");
    };


  const resetProductForm =
    () => {

      setProductForm({
        name: "",
        description: "",
        category: "",
        price: "",
        currency: "INR",
        stock: "",
      });


      setProductError("");
      setProductSuccess("");
    };


  const openAddProduct =
    () => {

      resetProductForm();

      setShowAddProduct(
        true
      );
    };


  const closeAddProduct =
    () => {

      if (
        productSaving
      ) {
        return;
      }


      setShowAddProduct(
        false
      );

      resetProductForm();
    };


  // ============================================================
  // ADD PRODUCT
  // ============================================================

  const handleAddProduct =
    async (
      event
    ) => {

      event.preventDefault();


      const name =
        productForm.name.trim();


      const description =
        productForm.description.trim();


      const category =
        productForm.category.trim();


      const price =
        Number(
          productForm.price
        );


      const stock =
        Number(
          productForm.stock
        );


      if (!name) {
        setProductError(
          "Product name is required."
        );
        return;
      }


      if (!category) {
        setProductError(
          "Category is required."
        );
        return;
      }


      if (
        !Number.isFinite(price) ||
        price <= 0
      ) {
        setProductError(
          "Enter a valid price greater than 0."
        );
        return;
      }


      if (
        !Number.isInteger(stock) ||
        stock < 0
      ) {
        setProductError(
          "Stock must be a whole number of 0 or more."
        );
        return;
      }


      setProductSaving(
        true
      );


      setProductError("");
      setProductSuccess("");


      try {

        await api.post(
          "/api/v1/products",
          {
            merchant_id:
              MERCHANT_ID,

            name,

            description,

            category,

            price,

            currency:
              productForm.currency ||
              "INR",

            stock,
          }
        );


        setProductSuccess(
          "Product added successfully."
        );


        setProductSaving(
          false
        );


        await loadDashboard();


        setTimeout(
          () => {
            setShowAddProduct(
              false
            );

            resetProductForm();
          },
          700
        );


      } catch (err) {

        console.error(
          "Add product error:",
          err
        );


        const detail =
          err?.response?.data?.detail;


        if (
          Array.isArray(detail)
        ) {

          setProductError(
            detail
              .map(
                (item) =>
                  item?.msg ||
                  "Invalid product data."
              )
              .join(" ")
          );

        } else if (
          typeof detail ===
          "string"
        ) {

          setProductError(
            detail
          );

        } else {

          setProductError(
            "Could not add the product. Check that FastAPI is running."
          );
        }


        setProductSaving(
          false
        );
      }
    };


  // ============================================================
  // ORDER FORM
  // ============================================================

  const handleOrderFormChange =
    (event) => {

      const {
        name,
        value,
      } = event.target;


      setOrderForm(
        (current) => ({
          ...current,
          [name]:
            name === "quantity"
              ? value
              : value,
        })
      );


      setOrderError("");
      setOrderSuccess("");
    };


  const resetOrderForm =
    () => {

      setOrderForm({
        product_id:
          products[0]?.id || "",
        quantity: 1,
      });


      setOrderError("");
      setOrderSuccess("");
    };


  const openCreateOrder =
    () => {

      setOrderForm({
        product_id:
          products[0]?.id || "",
        quantity: 1,
      });


      setOrderError("");
      setOrderSuccess("");


      setShowCreateOrder(
        true
      );
    };


  const closeCreateOrder =
    () => {

      if (
        orderSaving
      ) {
        return;
      }


      setShowCreateOrder(
        false
      );


      resetOrderForm();
    };


  // ============================================================
  // SELECTED ORDER PRODUCT
  // ============================================================

  const selectedOrderProduct =
    useMemo(() => {

      return products.find(
        (product) =>
          String(
            product?.id
          ) ===
          String(
            orderForm.product_id
          )
      );

    }, [
      products,
      orderForm.product_id,
    ]);


  const orderQuantity =
    Math.max(
      1,
      Number(
        orderForm.quantity || 1
      )
    );


  const orderTotal =
    selectedOrderProduct
      ? Number(
          selectedOrderProduct.price ||
          0
        ) *
        orderQuantity
      : 0;


  // ============================================================
  // CREATE ORDER
  // ============================================================

  const handleCreateOrder =
    async (
      event
    ) => {

      event.preventDefault();


      if (
        !orderForm.product_id
      ) {
        setOrderError(
          "Please select a product."
        );
        return;
      }


      if (
        !selectedOrderProduct
      ) {
        setOrderError(
          "Selected product was not found."
        );
        return;
      }


      const quantity =
        Number(
          orderForm.quantity
        );


      const availableStock =
        Number(
          selectedOrderProduct.stock ||
          0
        );


      if (
        !Number.isInteger(
          quantity
        ) ||
        quantity <= 0
      ) {
        setOrderError(
          "Quantity must be a whole number greater than 0."
        );
        return;
      }


      if (
        quantity >
        availableStock
      ) {
        setOrderError(
          `Only ${availableStock} units are available.`
        );
        return;
      }


      const totalAmount =
        Number(
          selectedOrderProduct.price ||
          0
        ) *
        quantity;


      if (
        !Number.isFinite(
          totalAmount
        ) ||
        totalAmount <= 0
      ) {
        setOrderError(
          "Could not calculate the order total."
        );
        return;
      }


      setOrderSaving(
        true
      );


      setOrderError("");
      setOrderSuccess("");


      try {

        await api.post(
          "/api/v1/orders",
          {
            merchant_id:
              MERCHANT_ID,

            product_id:
              selectedOrderProduct.id,

            quantity,

            total_amount:
              totalAmount,

            status:
              "completed",
          }
        );


        setOrderSuccess(
          "Order created successfully."
        );


        await Promise.all([
          loadDashboard(),
          loadDailyRevenue(),
          loadAIRecommendation(),
        ]);


        setOrderSaving(
          false
        );


        setTimeout(
          () => {

            setShowCreateOrder(
              false
            );

            resetOrderForm();

          },
          700
        );


      } catch (err) {

        console.error(
          "Create order error:",
          err
        );


        const detail =
          err?.response?.data?.detail;


        if (
          Array.isArray(detail)
        ) {

          setOrderError(
            detail
              .map(
                (item) =>
                  item?.msg ||
                  "Invalid order data."
              )
              .join(" ")
          );

        } else if (
          typeof detail ===
          "string"
        ) {

          setOrderError(
            detail
          );

        } else {

          setOrderError(
            "Could not create the order. Check the FastAPI backend."
          );
        }


        setOrderSaving(
          false
        );
      }
    };


  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="app-shell">

      {/* ======================================================
          NAVBAR
      ====================================================== */}

      <nav className="navbar navbar-expand-lg dashboard-navbar">

        <div className="container-fluid px-4 px-lg-5">

          <div className="d-flex align-items-center gap-3">

            <div className="brand-icon">
              <Sparkles size={22} />
            </div>


            <div>

              <div className="brand-name">
                RazorGrow AI
              </div>


              <div className="brand-subtitle">
                Business Intelligence Platform
              </div>

            </div>

          </div>


          <div className="d-flex align-items-center gap-3">

            <div className="connection-status">

              <span className="status-dot"></span>

              Backend Online

            </div>


            <button
              type="button"
              className="btn btn-light refresh-button"
              onClick={
                refreshAll
              }
              disabled={
                loading ||
                analyticsLoading ||
                aiLoading
              }
            >

              <RefreshCw
                size={16}
                className={
                  loading ||
                  analyticsLoading ||
                  aiLoading
                    ? "spin"
                    : ""
                }
              />

              <span className="d-none d-md-inline">
                Refresh
              </span>

            </button>

          </div>

        </div>

      </nav>


      {/* ======================================================
          MAIN
      ====================================================== */}

      <main className="container-fluid px-4 px-lg-5 py-4">

        {/* ====================================================
            HERO
        ==================================================== */}

        <section className="hero-card mb-4">

          <div className="hero-background-orb orb-one"></div>

          <div className="hero-background-orb orb-two"></div>


          <div className="position-relative">

            <div className="hero-label">

              <Activity size={15} />

              LIVE BUSINESS OVERVIEW

            </div>


            <h1 className="hero-title">
              Merchant Dashboard
            </h1>


            <p className="hero-description">
              Monitor sales, inventory and
              orders from one intelligent
              workspace.
            </p>


            <div className="hero-meta">

              <div>
                <Store size={16} />

                RazorGrow Demo Merchant
              </div>


              <div>

                <span className="merchant-id">
                  {MERCHANT_ID}
                </span>

              </div>

            </div>

          </div>


          <div className="hero-symbol">

            <BrainCircuit
              size={80}
              strokeWidth={1.2}
            />

          </div>

        </section>


        {/* ====================================================
            ERROR
        ==================================================== */}

        {error && (

          <div className="alert alert-danger dashboard-alert">

            <strong>
              Backend connection problem
            </strong>

            <br />

            {error}

          </div>

        )}


        {/* ====================================================
            LOADING
        ==================================================== */}

        {loading ? (

          <LoadingDashboard />

        ) : (

          <>

            {/* ==================================================
                BUSINESS OVERVIEW
            ================================================== */}

            <section className="mb-4">

              <div className="section-heading">

                <div>

                  <h2>
                    Business Overview
                  </h2>

                  <p>
                    Key performance indicators
                  </p>

                </div>

              </div>


              <div className="row g-4">

                <StatCard
                  title="Total Revenue"
                  value={
                    formatCurrency(
                      statistics.totalSales
                    )
                  }
                  icon={
                    <CircleDollarSign />
                  }
                  trend="Revenue generated"
                  positive
                />


                <StatCard
                  title="Total Orders"
                  value={
                    statistics.totalOrders
                  }
                  icon={
                    <ShoppingCart />
                  }
                  trend={
                    `${statistics.completedOrders} completed`
                  }
                  positive
                />


                <StatCard
                  title="Products"
                  value={
                    statistics.totalProducts
                  }
                  icon={
                    <Package />
                  }
                  trend="Active catalog"
                  positive
                />


                <StatCard
                  title="Inventory"
                  value={
                    statistics.totalStock
                  }
                  icon={
                    <Boxes />
                  }
                  trend="Units in stock"
                />

              </div>

            </section>


            {/* ==================================================
                LOW STOCK ALERTS
            ================================================== */}

            {lowStockProducts.length > 0 && (

              <section className="mb-4">

                <div
                  className="dashboard-card"
                  style={{
                    border: "1px solid #fde68a",
                    overflow: "hidden",
                  }}
                >

                  <div
                    className="card-header-custom"
                    style={{
                      background: "#fffbeb",
                    }}
                  >

                    <div className="d-flex align-items-center gap-3">

                      <div
                        className="d-flex align-items-center justify-content-center flex-shrink-0"
                        style={{
                          width: "42px",
                          height: "42px",
                          borderRadius: "12px",
                          background: "#fef3c7",
                          color: "#d97706",
                        }}
                      >
                        <AlertTriangle size={21} />
                      </div>

                      <div>

                        <h3 className="mb-0">
                          Low Stock Alerts
                        </h3>

                        <p className="mb-0">
                          Products with 20 or fewer units remaining
                        </p>

                      </div>

                    </div>

                    <span
                      className="badge rounded-pill"
                      style={{
                        background: "#fef3c7",
                        color: "#92400e",
                        padding: "8px 12px",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {lowStockProducts.length}{" "}
                      {lowStockProducts.length === 1
                        ? "Alert"
                        : "Alerts"}
                    </span>

                  </div>


                  <div className="p-3">

                    <div className="row g-3">

                      {lowStockProducts.map(
                        (product) => {

                          const stock =
                            Number(
                              product?.stock || 0
                            );

                          const isCritical =
                            stock <= 10;

                          return (

                            <div
                              className="col-12 col-md-6 col-xl-4"
                              key={product.id}
                            >

                              <div
                                className="h-100 d-flex align-items-center gap-3"
                                style={{
                                  padding: "14px",
                                  borderRadius: "12px",
                                  border: isCritical
                                    ? "1px solid #fecaca"
                                    : "1px solid #fde68a",
                                  background: isCritical
                                    ? "#fff7f7"
                                    : "#fffdf5",
                                }}
                              >

                                <div
                                  className="d-flex align-items-center justify-content-center flex-shrink-0"
                                  style={{
                                    width: "40px",
                                    height: "40px",
                                    borderRadius: "10px",
                                    background: isCritical
                                      ? "#fee2e2"
                                      : "#fef3c7",
                                    color: isCritical
                                      ? "#dc2626"
                                      : "#d97706",
                                  }}
                                >
                                  <Package size={19} />
                                </div>


                                <div
                                  className="flex-grow-1"
                                  style={{
                                    minWidth: 0,
                                  }}
                                >

                                  <div
                                    className="fw-semibold text-truncate"
                                    title={
                                      product?.name ||
                                      "Product"
                                    }
                                  >
                                    {product?.name ||
                                      "Unnamed product"}
                                  </div>

                                  <div
                                    className="small text-muted text-truncate"
                                    title={
                                      product?.category ||
                                      "General"
                                    }
                                  >
                                    {product?.category ||
                                      "General"}
                                  </div>

                                </div>


                                <div
                                  className="text-end flex-shrink-0"
                                  style={{
                                    minWidth: "72px",
                                  }}
                                >

                                  <div
                                    className="fw-bold"
                                    style={{
                                      color: isCritical
                                        ? "#dc2626"
                                        : "#d97706",
                                    }}
                                  >
                                    {stock}
                                  </div>

                                  <div className="small text-muted">
                                    {isCritical
                                      ? "Critical"
                                      : "Units left"}
                                  </div>

                                </div>

                              </div>

                            </div>

                          );
                        }
                      )}

                    </div>

                  </div>

                </div>

              </section>

            )}


            {/* ==================================================
                ANALYTICS SUMMARY
            ================================================== */}

            <section className="analytics-section mb-4">

              <div className="section-heading">

                <div>

                  <h2>
                    Analytics
                  </h2>

                  <p>
                    Real-time sales performance from your database
                  </p>

                </div>


                <div className="analytics-live-badge">
                  Live Data
                </div>

              </div>


              <div className="row g-4">

                <AnalyticsCard
                  title="Total Revenue"
                  value={
                    formatCurrency(
                      statistics.totalSales
                    )
                  }
                  icon={
                    <CircleDollarSign />
                  }
                  className="analytics-purple"
                />


                <AnalyticsCard
                  title="Total Orders"
                  value={
                    statistics.totalOrders
                  }
                  icon={
                    <ShoppingCart />
                  }
                  className="analytics-blue"
                />


                <AnalyticsCard
                  title="Units Sold"
                  value={
                    statistics.unitsSold
                  }
                  icon={
                    <Package />
                  }
                  className="analytics-green"
                />


                <AnalyticsCard
                  title="Average Order Value"
                  value={
                    formatCurrency(
                      statistics.averageOrderValue
                    )
                  }
                  icon={
                    <TrendingUp />
                  }
                  className="analytics-purple"
                />

              </div>

            </section>


            {/* ==================================================
                DAILY REVENUE CHART
            ================================================== */}

            <section className="dashboard-card daily-revenue-card mb-4">

              <div className="card-header-custom">

                <div>

                  <h3>

                    <BarChart3 size={20} />

                    Daily Revenue

                  </h3>

                  <p>
                    Actual revenue and orders recorded in PostgreSQL
                  </p>

                </div>


                <span className="badge-custom">

                  {chartData.length}

                  {" "}

                  {chartData.length === 1
                    ? "Day"
                    : "Days"}

                </span>

              </div>


              {/* =================================================
                  CHART
              ================================================= */}

              <div
                className="daily-chart-container"
                style={{
                  width: "100%",
                  height: "420px",
                  minHeight: "420px",
                  position: "relative",
                  padding: "20px 25px 30px 15px",
                }}
              >

                {analyticsLoading ? (

                  <div
                    style={{
                      width: "100%",
                      height: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#64748b",
                    }}
                  >

                    <div className="text-center">

                      <div
                        className="spinner-border text-primary mb-3"
                        role="status"
                      ></div>

                      <div>
                        Loading daily revenue...
                      </div>

                    </div>

                  </div>

                ) : analyticsError ? (

                  <div
                    style={{
                      width: "100%",
                      height: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: "30px",
                    }}
                  >

                    <div
                      className="alert alert-danger"
                      style={{
                        maxWidth: "700px",
                        width: "100%",
                      }}
                    >

                      <strong>
                        Analytics error
                      </strong>

                      <br />

                      {analyticsError}

                      <br />

                      <small>
                        Check the browser console for the API response.
                      </small>

                    </div>

                  </div>

                ) : chartData.length === 0 ? (

                  <div
                    style={{
                      width: "100%",
                      height: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#64748b",
                    }}
                  >

                    <div className="text-center">

                      <BarChart3
                        size={50}
                        strokeWidth={1.5}
                      />

                      <h5 className="mt-3">
                        No daily revenue data
                      </h5>

                      <p>
                        Create a completed order to generate chart data.
                      </p>

                    </div>

                  </div>

                ) : (

                  <ResponsiveContainer
                    width="100%"
                    height="100%"
                    minWidth={0}
                    minHeight={350}
                  >

                    <LineChart
                      data={chartData}
                      margin={{
                        top: 20,
                        right: 35,
                        left: 25,
                        bottom: 20,
                      }}
                    >

                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                      />


                      <XAxis
                        dataKey="displayDate"
                        tick={{
                          fontSize: 12,
                        }}
                        tickLine={false}
                        axisLine={{
                          stroke: "#cbd5e1",
                        }}
                      />


                      <YAxis
                        yAxisId="revenue"
                        orientation="left"
                        tick={{
                          fontSize: 12,
                        }}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={
                          (value) =>
                            `₹${Number(value).toLocaleString("en-IN")}`
                        }
                      />


                      <YAxis
                        yAxisId="orders"
                        orientation="right"
                        allowDecimals={false}
                        tick={{
                          fontSize: 12,
                        }}
                        tickLine={false}
                        axisLine={false}
                      />


                      <Tooltip
                        cursor={{
                          strokeDasharray:
                            "4 4",
                        }}
                        content={
                          <DailyRevenueTooltip
                            formatCurrency={
                              formatCurrency
                            }
                          />
                        }
                      />


                      <Legend
                        verticalAlign="bottom"
                        height={36}
                        iconType="line"
                      />


                      <Line
                        yAxisId="revenue"
                        type="monotone"
                        dataKey="revenue"
                        name="Revenue"
                        stroke="#4f46e5"
                        strokeWidth={4}
                        dot={{
                          r: 6,
                          strokeWidth: 2,
                        }}
                        activeDot={{
                          r: 8,
                          strokeWidth: 2,
                        }}
                        isAnimationActive={
                          false
                        }
                      />


                      <Line
                        yAxisId="orders"
                        type="monotone"
                        dataKey="orders"
                        name="Orders"
                        stroke="#16a34a"
                        strokeWidth={4}
                        dot={{
                          r: 6,
                          strokeWidth: 2,
                        }}
                        activeDot={{
                          r: 8,
                          strokeWidth: 2,
                        }}
                        isAnimationActive={
                          false
                        }
                      />

                    </LineChart>

                  </ResponsiveContainer>

                )}

              </div>

            </section>


            {/* ==================================================
                SECONDARY STATS
            ================================================== */}

            <div className="row g-4 mb-4">

              <div className="col-12 col-lg-4">

                <div className="mini-card">

                  <div className="mini-icon purple">
                    <TrendingUp size={20} />
                  </div>

                  <div>

                    <div className="mini-label">
                      Average Order Value
                    </div>

                    <div className="mini-value">
                      {
                        formatCurrency(
                          statistics.averageOrderValue
                        )
                      }
                    </div>

                  </div>

                </div>

              </div>


              <div className="col-12 col-lg-4">

                <div className="mini-card">

                  <div className="mini-icon blue">
                    <Users size={20} />
                  </div>

                  <div>

                    <div className="mini-label">
                      Merchant
                    </div>

                    <div className="mini-value">
                      Fashion Store
                    </div>

                  </div>

                </div>

              </div>


              <div className="col-12 col-lg-4">

                <div className="mini-card">

                  <div className="mini-icon green">
                    <Activity size={20} />
                  </div>

                  <div>

                    <div className="mini-label">
                      System Status
                    </div>

                    <div className="mini-value status-text">
                      Operational
                    </div>

                  </div>

                </div>

              </div>

            </div>


            {/* ==================================================
                PRODUCTS + ORDERS
            ================================================== */}

            <div className="row g-4">


              {/* =================================================
                  PRODUCTS
              ================================================= */}

              <div className="col-12 col-xl-7">

                <div className="dashboard-card">

                  <div className="card-header-custom">

                    <div>

                      <h3>

                        <Package size={20} />

                        Product Inventory

                      </h3>

                      <p>
                        Current products and stock levels
                      </p>

                    </div>


                    <div className="d-flex align-items-center gap-2">

                      <span className="badge-custom">
                        {products.length} Products
                      </span>


                      <button
                        type="button"
                        className="btn btn-primary btn-sm d-flex align-items-center gap-1"
                        onClick={
                          openAddProduct
                        }
                      >

                        <PackagePlus size={15} />

                        Add Product

                      </button>

                    </div>

                  </div>


                  {topProducts.length === 0 ? (

                    <EmptyState
                      icon={
                        <Package />
                      }
                      text="No products found."
                    />

                  ) : (

                    <div className="table-responsive">

                      <table className="table dashboard-table align-middle">

                        <thead>

                          <tr>

                            <th>
                              Product
                            </th>

                            <th>
                              Category
                            </th>

                            <th>
                              Price
                            </th>

                            <th>
                              Stock
                            </th>

                          </tr>

                        </thead>


                        <tbody>

                          {topProducts.map(
                            (product) => (

                              <tr
                                key={
                                  product.id
                                }
                              >

                                <td>

                                  <div className="product-name">
                                    {
                                      product.name
                                    }
                                  </div>

                                  <div className="product-id">
                                    {
                                      String(
                                        product.id
                                      ).slice(
                                        0,
                                        12
                                      )
                                    }
                                    ...
                                  </div>

                                </td>


                                <td>

                                  <span className="category-badge">

                                    {
                                      product.category ||
                                      "General"
                                    }

                                  </span>

                                </td>


                                <td className="price-text">

                                  {
                                    formatCurrency(
                                      product.price
                                    )
                                  }

                                </td>


                                <td>

                                  <StockBadge
                                    stock={
                                      product.stock
                                    }
                                  />

                                </td>

                              </tr>

                            )
                          )}

                        </tbody>

                      </table>

                    </div>

                  )}

                </div>

              </div>


              {/* =================================================
                  ORDERS
              ================================================= */}

              <div className="col-12 col-xl-5">

                <div className="dashboard-card">

                  <div className="card-header-custom">

                    <div>

                      <h3>

                        <ShoppingCart size={20} />

                        Recent Orders

                      </h3>

                      <p>
                        Latest customer transactions
                      </p>

                    </div>


                    <div className="d-flex align-items-center gap-2">

                      <span className="badge-custom">
                        {orders.length} Total
                      </span>


                      <button
                        type="button"
                        className="btn btn-primary btn-sm d-flex align-items-center gap-1"
                        onClick={
                          openCreateOrder
                        }
                        disabled={
                          products.length === 0
                        }
                      >

                        <ShoppingCart size={15} />

                        Create Order

                      </button>

                    </div>

                  </div>


                  {recentOrders.length === 0 ? (

                    <EmptyState
                      icon={
                        <ShoppingCart />
                      }
                      text="No orders found."
                    />

                  ) : (

                    <div className="orders-list">

                      {recentOrders.map(
                        (order) => (

                          <div
                            className="order-item"
                            key={
                              order.id
                            }
                          >

                            <div className="order-icon">

                              <ShoppingCart
                                size={17}
                              />

                            </div>


                            <div className="order-main">

                              <div className="order-title">

                                Order #

                                {
                                  String(
                                    order.id
                                  ).slice(
                                    0,
                                    8
                                  )
                                }

                              </div>


                              <div className="order-date">

                                {
                                  formatDate(
                                    order.created_at
                                  )
                                }

                              </div>

                            </div>


                            <div className="order-right">

                              <div className="order-amount">

                                {
                                  formatCurrency(
                                    order.total_amount
                                  )
                                }

                              </div>


                              <span
                                className={
                                  `status-badge ${
                                    order.status ===
                                    "completed"
                                      ? "completed"
                                      : "pending"
                                  }`
                                }
                              >

                                {
                                  order.status ||
                                  "pending"
                                }

                              </span>

                            </div>

                          </div>

                        )
                      )}

                    </div>

                  )}

                </div>

              </div>

            </div>


            {/* ==================================================
                AI SECTION
            ================================================== */}

            <section className="ai-card mt-4">

              <div className="ai-glow"></div>


              <div className="position-relative">

                <div className="ai-icon">

                  <BrainCircuit
                    size={28}
                  />

                </div>


                <div className="ai-content">

                  <div className="ai-label">

                    <Sparkles size={15} />

                    RAZORGROW INTELLIGENCE

                  </div>


                  <h2>
                    AI Business Insights
                  </h2>


                  <p>

                    Powered locally by

                    <strong>
                      {" "}Qwen3:4b{" "}
                    </strong>

                    through Ollama — no paid
                    OpenAI credits required.

                  </p>


                  {/* ===========================================
                      BASIC INSIGHTS
                  =========================================== */}

                  <div className="row g-3 mt-2">

                    <Insight
                      title="Revenue"
                      text={
                        statistics.totalSales >
                        0
                          ? `Your store has generated ${formatCurrency(
                              statistics.totalSales
                            )} in recorded sales.`
                          : "No sales have been recorded yet."
                      }
                    />


                    <Insight
                      title="Inventory"
                      text={
                        statistics.totalStock >
                        0
                          ? `${statistics.totalStock} units are currently available in inventory.`
                          : "Inventory is currently empty."
                      }
                    />


                    <Insight
                      title="Orders"
                      text={
                        statistics.totalOrders >
                        0
                          ? `${statistics.totalOrders} order(s) are currently recorded.`
                          : "No orders are currently recorded."
                      }
                    />

                  </div>


                  {/* ===========================================
                      AI RECOMMENDATION
                  =========================================== */}

                  <div className="ai-recommendation mt-4">

                    <div className="ai-recommendation-header">

                      <div className="d-flex align-items-center gap-2">

                        <Sparkles
                          size={18}
                        />

                        <span>
                          Qwen3 Business Recommendation
                        </span>

                      </div>


                      <button
                        type="button"
                        className="btn btn-light btn-sm"
                        onClick={
                          loadAIRecommendation
                        }
                        disabled={
                          aiLoading
                        }
                      >

                        <RefreshCw
                          size={14}
                          className={
                            aiLoading
                              ? "spin"
                              : ""
                          }
                        />

                        <span className="ms-1">

                          {
                            aiLoading
                              ? "Thinking..."
                              : "Generate"
                          }

                        </span>

                      </button>

                    </div>


                    <div className="ai-recommendation-body">

                      {aiLoading ? (

                        <div className="ai-loading">

                          <div className="spinner-border spinner-border-sm me-2"></div>

                          Qwen3 is analyzing
                          your business data...

                        </div>

                      ) : aiError ? (

                        <div className="ai-error">

                          <strong>
                            AI connection problem
                          </strong>

                          <br />

                          {aiError}

                        </div>

                      ) : aiRecommendation ? (

                        <div className="ai-result">

                          <div className="ai-result-icon">

                            <BrainCircuit
                              size={22}
                            />

                          </div>


                          <div className="ai-result-text">

                            {renderAIRecommendation({
                              text: aiRecommendation,
                            })}

                          </div>

                        </div>

                      ) : (

                        <div className="ai-empty">

                          Click

                          <strong>
                            {" Generate "}
                          </strong>

                          to get a business
                          recommendation
                          from Qwen3.

                        </div>

                      )}

                    </div>

                  </div>

                </div>

              </div>

            </section>

          </>

        )}


        {/* ======================================================
            ADD PRODUCT MODAL
        ====================================================== */}

        {showAddProduct && (

          <>

            <div
              className="modal-backdrop fade show"
              style={{
                zIndex: 1040,
              }}
              onClick={
                closeAddProduct
              }
            ></div>


            <div
              className="modal d-block"
              tabIndex="-1"
              role="dialog"
              aria-modal="true"
              style={{
                zIndex: 1050,
              }}
            >

              <div className="modal-dialog modal-dialog-centered modal-lg">

                <div className="modal-content border-0 shadow-lg">

                  <form
                    onSubmit={
                      handleAddProduct
                    }
                  >

                    <div className="modal-header">

                      <div>

                        <h5 className="modal-title fw-bold mb-1">

                          Add New Product

                        </h5>


                        <small className="text-muted">

                          Add a product to your RazorGrow inventory.

                        </small>

                      </div>


                      <button
                        type="button"
                        className="btn-close"
                        aria-label="Close"
                        onClick={
                          closeAddProduct
                        }
                        disabled={
                          productSaving
                        }
                      ></button>

                    </div>


                    <div className="modal-body">

                      {productError && (

                        <div className="alert alert-danger py-2">

                          <strong>
                            Product error:
                          </strong>

                          {" "}

                          {productError}

                        </div>

                      )}


                      {productSuccess && (

                        <div className="alert alert-success py-2">

                          <CheckCircle2
                            size={16}
                            className="me-1"
                          />

                          {productSuccess}

                        </div>

                      )}


                      <div className="row g-3">

                        <div className="col-12">

                          <label className="form-label fw-semibold">
                            Product Name *
                          </label>


                          <input
                            type="text"
                            className="form-control"
                            name="name"
                            value={
                              productForm.name
                            }
                            onChange={
                              handleProductFormChange
                            }
                            placeholder="e.g. Premium Denim Jacket"
                            disabled={
                              productSaving
                            }
                            required
                          />

                        </div>


                        <div className="col-12">

                          <label className="form-label fw-semibold">
                            Description
                          </label>


                          <textarea
                            className="form-control"
                            name="description"
                            value={
                              productForm.description
                            }
                            onChange={
                              handleProductFormChange
                            }
                            placeholder="Describe the product..."
                            rows="3"
                            disabled={
                              productSaving
                            }
                          ></textarea>

                        </div>


                        <div className="col-md-6">

                          <label className="form-label fw-semibold">
                            Category *
                          </label>


                          <input
                            type="text"
                            className="form-control"
                            name="category"
                            value={
                              productForm.category
                            }
                            onChange={
                              handleProductFormChange
                            }
                            placeholder="e.g. Fashion"
                            disabled={
                              productSaving
                            }
                            required
                          />

                        </div>


                        <div className="col-md-3">

                          <label className="form-label fw-semibold">
                            Price *
                          </label>


                          <input
                            type="number"
                            className="form-control"
                            name="price"
                            value={
                              productForm.price
                            }
                            onChange={
                              handleProductFormChange
                            }
                            placeholder="799"
                            min="0.01"
                            step="0.01"
                            disabled={
                              productSaving
                            }
                            required
                          />

                        </div>


                        <div className="col-md-3">

                          <label className="form-label fw-semibold">
                            Currency
                          </label>


                          <select
                            className="form-select"
                            name="currency"
                            value={
                              productForm.currency
                            }
                            onChange={
                              handleProductFormChange
                            }
                            disabled={
                              productSaving
                            }
                          >

                            <option value="INR">
                              INR (₹)
                            </option>

                            <option value="USD">
                              USD ($)
                            </option>

                            <option value="EUR">
                              EUR (€)
                            </option>

                          </select>

                        </div>


                        <div className="col-md-6">

                          <label className="form-label fw-semibold">
                            Stock *
                          </label>


                          <input
                            type="number"
                            className="form-control"
                            name="stock"
                            value={
                              productForm.stock
                            }
                            onChange={
                              handleProductFormChange
                            }
                            placeholder="100"
                            min="0"
                            step="1"
                            disabled={
                              productSaving
                            }
                            required
                          />

                        </div>

                      </div>

                    </div>


                    <div className="modal-footer">

                      <button
                        type="button"
                        className="btn btn-light"
                        onClick={
                          closeAddProduct
                        }
                        disabled={
                          productSaving
                        }
                      >
                        Cancel
                      </button>


                      <button
                        type="submit"
                        className="btn btn-primary d-flex align-items-center gap-2"
                        disabled={
                          productSaving
                        }
                      >

                        {productSaving ? (

                          <>

                            <span className="spinner-border spinner-border-sm"></span>

                            Adding...

                          </>

                        ) : (

                          <>

                            <PackagePlus size={16} />

                            Add Product

                          </>

                        )}

                      </button>

                    </div>

                  </form>

                </div>

              </div>

            </div>

          </>

        )}


        {/* ======================================================
            CREATE ORDER MODAL
        ====================================================== */}

        {showCreateOrder && (

          <>

            <div
              className="modal-backdrop fade show"
              style={{
                zIndex: 1040,
              }}
              onClick={
                closeCreateOrder
              }
            ></div>


            <div
              className="modal d-block"
              tabIndex="-1"
              role="dialog"
              aria-modal="true"
              style={{
                zIndex: 1050,
              }}
            >

              <div className="modal-dialog modal-dialog-centered">

                <div className="modal-content border-0 shadow-lg">

                  <form
                    onSubmit={
                      handleCreateOrder
                    }
                  >

                    <div className="modal-header">

                      <div>

                        <h5 className="modal-title fw-bold mb-1">

                          Create New Order

                        </h5>


                        <small className="text-muted">

                          Create a customer order from your inventory.

                        </small>

                      </div>


                      <button
                        type="button"
                        className="btn-close"
                        aria-label="Close"
                        onClick={
                          closeCreateOrder
                        }
                        disabled={
                          orderSaving
                        }
                      ></button>

                    </div>


                    <div className="modal-body">

                      {orderError && (

                        <div className="alert alert-danger py-2">

                          <AlertCircle
                            size={16}
                            className="me-1"
                          />

                          <strong>
                            Order error:
                          </strong>

                          {" "}

                          {orderError}

                        </div>

                      )}


                      {orderSuccess && (

                        <div className="alert alert-success py-2">

                          <CheckCircle2
                            size={16}
                            className="me-1"
                          />

                          {orderSuccess}

                        </div>

                      )}


                      <div className="mb-3">

                        <label className="form-label fw-semibold">

                          Select Product *

                        </label>


                        <select
                          className="form-select"
                          name="product_id"
                          value={
                            orderForm.product_id
                          }
                          onChange={
                            handleOrderFormChange
                          }
                          disabled={
                            orderSaving
                          }
                          required
                        >

                          <option value="">
                            Select a product
                          </option>


                          {products.map(
                            (product) => (

                              <option
                                key={
                                  product.id
                                }
                                value={
                                  product.id
                                }
                              >

                                {
                                  product.name
                                }

                                {" — "}

                                {
                                  formatCurrency(
                                    product.price
                                  )
                                }

                                {" — Stock: "}

                                {
                                  product.stock
                                }

                              </option>

                            )
                          )}

                        </select>

                      </div>


                      {selectedOrderProduct && (

                        <div
                          className="p-3 mb-3 rounded"
                          style={{
                            background:
                              "#f8fafc",
                          }}
                        >

                          <div className="d-flex justify-content-between mb-2">

                            <span>
                              Product
                            </span>

                            <strong>
                              {
                                selectedOrderProduct.name
                              }
                            </strong>

                          </div>


                          <div className="d-flex justify-content-between mb-2">

                            <span>
                              Price
                            </span>

                            <strong>
                              {
                                formatCurrency(
                                  selectedOrderProduct.price
                                )
                              }
                            </strong>

                          </div>


                          <div className="d-flex justify-content-between">

                            <span>
                              Available Stock
                            </span>

                            <strong>
                              {
                                selectedOrderProduct.stock
                              }{" "}
                              units
                            </strong>

                          </div>

                        </div>

                      )}


                      <div className="mb-3">

                        <label className="form-label fw-semibold">

                          Quantity *

                        </label>


                        <input
                          type="number"
                          className="form-control"
                          name="quantity"
                          value={
                            orderForm.quantity
                          }
                          onChange={
                            handleOrderFormChange
                          }
                          min="1"
                          max={
                            selectedOrderProduct
                              ? selectedOrderProduct.stock
                              : 10000
                          }
                          step="1"
                          disabled={
                            orderSaving
                          }
                          required
                        />

                      </div>


                      <div
                        className="border rounded p-3"
                        style={{
                          background:
                            "#ffffff",
                        }}
                      >

                        <div className="d-flex justify-content-between align-items-center">

                          <span className="fw-semibold">
                            Order Total
                          </span>


                          <strong
                            style={{
                              fontSize:
                                "1.5rem",
                              color:
                                "#2563eb",
                            }}
                          >

                            {
                              formatCurrency(
                                orderTotal
                              )
                            }

                          </strong>

                        </div>

                      </div>

                    </div>


                    <div className="modal-footer">

                      <button
                        type="button"
                        className="btn btn-light"
                        onClick={
                          closeCreateOrder
                        }
                        disabled={
                          orderSaving
                        }
                      >
                        Cancel
                      </button>


                      <button
                        type="submit"
                        className="btn btn-primary d-flex align-items-center gap-2"
                        disabled={
                          orderSaving ||
                          !selectedOrderProduct
                        }
                      >

                        {orderSaving ? (

                          <>

                            <span className="spinner-border spinner-border-sm"></span>

                            Creating...

                          </>

                        ) : (

                          <>

                            <ShoppingCart
                              size={16}
                            />

                            Create Order

                          </>

                        )}

                      </button>

                    </div>

                  </form>

                </div>

              </div>

            </div>

          </>

        )}


        {/* ======================================================
            FOOTER
        ====================================================== */}

        <footer className="dashboard-footer">

          <div>

            RazorGrow AI

            <span>
              {" • "}
            </span>

            Business Intelligence Dashboard

          </div>


          <div>

            {lastUpdated
              ? `Updated ${lastUpdated.toLocaleTimeString()}`
              : "Connecting..."}

          </div>

        </footer>

      </main>

    </div>
  );
}


// ============================================================
// DAILY REVENUE TOOLTIP
// ============================================================

function DailyRevenueTooltip({
  active,
  payload,
  label,
  formatCurrency,
}) {

  if (
    !active ||
    !payload ||
    !payload.length
  ) {
    return null;
  }


  const revenueItem =
    payload.find(
      (item) =>
        item.dataKey ===
        "revenue"
    );


  const ordersItem =
    payload.find(
      (item) =>
        item.dataKey ===
        "orders"
    );


  return (

    <div
      style={{
        background: "#ffffff",
        border: "1px solid #e2e8f0",
        borderRadius: "10px",
        padding: "12px 15px",
        boxShadow:
          "0 8px 25px rgba(15, 23, 42, 0.12)",
      }}
    >

      <div
        style={{
          fontWeight: 700,
          marginBottom: "8px",
          color: "#0f172a",
        }}
      >
        {label}
      </div>


      {revenueItem && (

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: "30px",
            marginBottom: "5px",
          }}
        >

          <span>
            Revenue
          </span>

          <strong>
            {
              formatCurrency(
                revenueItem.value
              )
            }
          </strong>

        </div>

      )}


      {ordersItem && (

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: "30px",
          }}
        >

          <span>
            Orders
          </span>

          <strong>
            {ordersItem.value}
          </strong>

        </div>

      )}

    </div>
  );
}


// ============================================================
// STAT CARD
// ============================================================

function StatCard({
  title,
  value,
  icon,
  trend,
  positive,
}) {

  return (

    <div className="col-12 col-sm-6 col-xl-3">

      <div className="stat-card">

        <div className="stat-top">

          <div className="stat-icon">
            {icon}
          </div>


          <div className="stat-trend">

            {positive ? (

              <ArrowUpRight
                size={15}
              />

            ) : (

              <ArrowDownRight
                size={15}
              />

            )}

          </div>

        </div>


        <div className="stat-title">
          {title}
        </div>


        <div className="stat-value">
          {value}
        </div>


        <div className="stat-description">
          {trend}
        </div>

      </div>

    </div>
  );
}


// ============================================================
// ANALYTICS CARD
// ============================================================

function AnalyticsCard({
  title,
  value,
  icon,
  className = "",
}) {

  return (

    <div className="col-12 col-md-6">

      <div
        className={
          `analytics-summary-card ${className}`
        }
      >

        <div className="analytics-summary-icon">
          {icon}
        </div>


        <div>

          <div className="analytics-summary-title">
            {title}
          </div>


          <div className="analytics-summary-value">
            {value}
          </div>

        </div>

      </div>

    </div>
  );
}


// ============================================================
// STOCK BADGE
// ============================================================

function StockBadge({
  stock,
}) {

  const value =
    Number(
      stock || 0
    );


  let className =
    "stock-good";


  if (
    value === 0
  ) {

    className =
      "stock-empty";

  } else if (
    value < 20
  ) {

    className =
      "stock-low";
  }


  return (

    <span
      className={
        `stock-badge ${className}`
      }
    >

      {value}

      {" "}

      units

    </span>
  );
}


// ============================================================
// INSIGHT
// ============================================================

function Insight({
  title,
  text,
}) {

  return (

    <div className="col-12 col-md-4">

      <div className="insight-box">

        <div className="insight-title">
          {title}
        </div>


        <div className="insight-text">
          {text}
        </div>

      </div>

    </div>
  );
}


// ============================================================
// EMPTY STATE
// ============================================================

function EmptyState({
  icon,
  text,
}) {

  return (

    <div className="empty-state">

      <div className="empty-icon">
        {icon}
      </div>


      <p>
        {text}
      </p>

    </div>
  );
}


// ============================================================
// LOADING DASHBOARD
// ============================================================

function LoadingDashboard() {

  return (

    <div className="loading-wrapper">

      <div
        className="spinner-border text-primary mb-3"
      ></div>


      <h5>
        Loading RazorGrow dashboard...
      </h5>


      <p>
        Connecting to your FastAPI backend.
      </p>

    </div>
  );
}


// ============================================================
// EXPORT
// ============================================================

export default App;