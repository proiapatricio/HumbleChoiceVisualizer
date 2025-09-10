using Microsoft.Extensions.FileProviders;

var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

app.UseDefaultFiles();  // index.html como página por defecto
app.UseStaticFiles();   // Habilita archivos estáticos

app.Run();