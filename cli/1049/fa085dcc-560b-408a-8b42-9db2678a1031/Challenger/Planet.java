public class Planet {
    String name;
    int x;
    int y;
    float planetSize;
    int fleetSize;
    String color;

    public Planet(String name, String x, String y, String planetSize, String fleetSize, String color) {
        this.name = name;
        this.x = Integer.parseInt(x);
        this.y = Integer.parseInt(y);
        this.planetSize = Float.parseFloat(planetSize);
        this.fleetSize = Integer.parseInt(fleetSize);
        this.color = color;
    }

    public float getPlanetSize() {
        return planetSize;
    }

    public int getFleetSize() {
        return fleetSize;
    }

    public String getName() {
        return name;
    }

    public int getX() {
        return x;
    }

    public int getY() {
        return y;
    }

    public String getColor() {
        return color;
    }
}
