using Microsoft.Extensions.FileProviders;

var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

app.UseDefaultFiles();  // index.html como p�gina por defecto
app.UseStaticFiles();   // Habilita archivos est�ticos

app.Run();