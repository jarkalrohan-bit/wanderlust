
import { useEffect, useState } from "react";
import axios from "axios";
import {
  Compass, Search, Menu, ArrowUpRight,
  MapPin, PenLine, LogOut, X
} from "lucide-react";

const api = axios.create({ baseURL: "/api" });

function App() {
  const [posts, setPosts] = useState([]);
  const [search, setSearch] = useState("");
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("user") || "null")
  );
  const [modal, setModal] = useState("");
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({
    title: "", content: "", excerpt: "",
    category: "Adventure", coverImage: ""
  });
  const [credentials, setCredentials] = useState({
    name: "", email: "", password: ""
  });
  const [error, setError] = useState("");

  async function loadPosts() {
    try {
      const { data } = await api.get("/posts", {
        params: { search, limit: 20 }
      });
      setPosts(data.posts);
    } catch {
      setError("Unable to load stories. Please try again.");
    }
  }

  useEffect(() => {
    const timer = setTimeout(loadPosts, 300);
    return () => clearTimeout(timer);
  }, [search]);

  async function authenticate(e) {
    e.preventDefault();
    setError("");

    try {
      const endpoint = modal === "register" ? "/auth/register" : "/auth/login";
      const { data } = await api.post(endpoint, credentials);

      if (modal === "register") {
        setModal("login");
        setCredentials({ name: "", email: credentials.email, password: "" });
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
      setModal("");
    } catch (err) {
      setError(err.response?.data?.message || "Authentication failed");
    }
  }

  // async function createPost(e) {
  //   e.preventDefault();
  //   setError("");

  //   try {
  //     await api.post("/posts", form, {
  //       headers: { Authorization: `Bearer ${token}` }
  //     });

  //     setForm({
  //       title: "", content: "", excerpt: "",
  //       category: "Adventure", coverImage: ""
  //     });

  //     setModal("");
  //     loadPosts();
  //   } catch (err) {
  //     setError(err.response?.data?.message || "Unable to publish story");
  //   }
  // }
  
async function createPost(e) {
  e.preventDefault();
  setError("");

  if (!token) {
    setError("Please login before publishing a story.");
    setModal("login");
    return;
  }

  try {
    const response = await api.post("/posts", form, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    console.log("Story published:", response.data);

    setForm({
      title: "",
      content: "",
      excerpt: "",
      category: "Adventure",
      coverImage: ""
    });

    setModal("");
    await loadPosts();

  } catch (err) {
    console.error("Publish error:", err.response?.data || err);

    setError(
      err.response?.data?.message ||
      err.message ||
      "Unable to publish story. Please try again."
    );
  }
}



  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
  }

  const featured = posts[0];

  return (
    <div className="app">
      <nav className="navbar">
        <a className="logo" href="#">
          <Compass size={28} /> WanderLust<span>.</span>
        </a>

        <div className="nav-links">
          <a href="#home">Home</a>
          <a href="#stories">Stories</a>
          <a href="#about">About</a>
        </div>

        <div className="nav-actions">
          {token ? (
            <>
              <span className="welcome">Hi, {user?.name}</span>
              <button className="outline-btn"
                onClick={() => setModal("create")}>
                <PenLine size={16}/> Write
              </button>
              <button className="icon-btn" onClick={logout}>
                <LogOut size={18}/>
              </button>
            </>
          ) : (
            <>
              <button className="login-btn"
                onClick={() => setModal("login")}>Login</button>
              <button className="primary-btn"
                onClick={() => setModal("register")}>Join us</button>
            </>
          )}
        </div>
      </nav>

      <main>
        <section className="hero" id="home">
          <div className="hero-overlay">
            <div className="hero-content">
              <span className="eyebrow">EXPLORE • DREAM • DISCOVER</span>
              <h1>The world is a book.<br/>
                <i>Go write your story.</i>
              </h1>
              <p>
                Discover incredible places, meet new cultures,
                and find inspiration for your next adventure.
              </p>
              <a href="#stories" className="hero-btn">
                Explore stories <ArrowUpRight size={18}/>
              </a>
            </div>
          </div>
        </section>

        <section className="intro" id="about">
          <span className="eyebrow dark">THE WANDERLUST JOURNAL</span>
          <h2>Stories that take you places.</h2>
          <p>
            A community of explorers sharing experiences,
            hidden gems and unforgettable journeys.
          </p>
        </section>

        <section className="stories" id="stories">
          <div className="section-heading">
            <div>
              <span className="eyebrow dark">OUR TRAVEL JOURNAL</span>
              <h2>Latest adventures</h2>
            </div>

            <div className="search-box">
              <Search size={18}/>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search stories..."
              />
            </div>
          </div>

          {error && <p className="error">{error}</p>}

          {posts.length === 0 ? (
            <div className="empty">
              <Compass size={42}/>
              <h3>No stories yet</h3>
              <p>Be the first to share a travel adventure!</p>
              {token && (
                <button className="primary-btn"
                  onClick={() => setModal("create")}>
                  Write your first story
                </button>
              )}
            </div>
          ) : (
            <div className="post-grid">
              {posts.map(post => (
                <article className="post-card" key={post._id}>
                  <img
                    src={post.coverImage || "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=900"}
                    alt={post.title}
                  />
                  <div className="post-info">
                    <span className="category">{post.category}</span>
                    <h3>{post.title}</h3>
                    <p>{post.excerpt || post.content.slice(0, 130)}</p>
                    <div className="post-footer">
                      <span>{post.author?.name || "Traveler"}</span>
                      <button onClick={() => {
                        setSelected(post);
                        setModal("read");
                      }}>
                        Read story <ArrowUpRight size={16}/>
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>

      <footer>
        <a className="logo" href="#">
          <Compass size={24}/> WanderLust<span>.</span>
        </a>
        <p>Made for people who love exploring the world.</p>
        <small>© {new Date().getFullYear()} WanderLust. All rights reserved.</small>
      </footer>

      {modal && (
        <div className="modal-backdrop" onClick={() => {
          setModal(""); setError("");
        }}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <button className="close-btn"
              onClick={() => setModal("")}><X/></button>

            {modal === "read" && selected && (
              <>
                <img className="read-image"
                  src={selected.coverImage || "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=900"}
                  alt={selected.title}/>
                <span className="category">{selected.category}</span>
                <h2>{selected.title}</h2>
                <p className="author">By {selected.author?.name || "Traveler"}</p>
                <p className="article-content">{selected.content}</p>
              </>
            )}

            {(modal === "login" || modal === "register") && (
              <>
                <h2>{modal === "login" ? "Welcome back" : "Join WanderLust"}</h2>
                <p>Share your journey with the world.</p>
                <form onSubmit={authenticate}>
                  {modal === "register" && (
                    <input required placeholder="Your name"
                      value={credentials.name}
                      onChange={e => setCredentials({
                        ...credentials, name: e.target.value
                      })}/>
                  )}
                  <input required type="email" placeholder="Email address"
                    value={credentials.email}
                    onChange={e => setCredentials({
                      ...credentials, email: e.target.value
                    })}/>
                  <input required minLength="8" type="password"
                    placeholder="Password"
                    value={credentials.password}
                    onChange={e => setCredentials({
                      ...credentials, password: e.target.value
                    })}/>
                  {error && <p className="error">{error}</p>}
                  <button className="primary-btn block">
                    {modal === "login" ? "Login" : "Create account"}
                  </button>
                </form>
                <button className="switch-btn"
                  onClick={() => {
                    setError("");
                    setModal(modal === "login" ? "register" : "login");
                  }}>
                  {modal === "login"
                    ? "New here? Create an account"
                    : "Already registered? Login"}
                </button>
              </>
            )}

            {modal === "create" && (
              <>
                <h2>Share your adventure</h2>
                <form onSubmit={createPost}>
                  <input required maxLength="150" placeholder="Story title"
                    value={form.title}
                    onChange={e => setForm({
                      ...form, title: e.target.value
                    })}/>
                  <input placeholder="Cover image URL (optional)"
                    value={form.coverImage}
                    onChange={e => setForm({
                      ...form, coverImage: e.target.value
                    })}/>
                  <input placeholder="Category"
                    value={form.category}
                    onChange={e => setForm({
                      ...form, category: e.target.value
                    })}/>
                  <textarea required rows="7" placeholder="Tell your story..."
                    value={form.content}
                    onChange={e => setForm({
                      ...form, content: e.target.value
                    })}/>
                  <input placeholder="Short description (optional)"
                    value={form.excerpt}
                    onChange={e => setForm({
                      ...form, excerpt: e.target.value
                    })}/>
                  {error && <p className="error">{error}</p>}
                  <button className="primary-btn block">Publish story</button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;

