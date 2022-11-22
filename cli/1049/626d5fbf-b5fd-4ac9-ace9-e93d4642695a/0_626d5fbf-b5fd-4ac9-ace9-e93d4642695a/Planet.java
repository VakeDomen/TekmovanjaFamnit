/**
 * Created by mihael
 * on 11/03/2022 at 11:21
 * using IntelliJ IDEA
 */
class Planet implements Comparable {

    int name, x, y, fleetSize;
    float  planetSize;
    String color;

    public Planet(int name, int x, int y, float planetSize, int fleetSize, String color) {
        this.name       = name;
        this.x          = x;
        this.y          = y;
        this.planetSize = planetSize;
        this.fleetSize  = fleetSize;
        this.color      = color;
    }

    public int getFleetSize() {
        return fleetSize;
    }

    public double distanceTo(Planet planet) {
        return Math.sqrt((planet.y - y) * (planet.y - y) + (planet.x - x) * (planet.x - x));
    }

    @Override
    public int compareTo(Object o) {
        return o instanceof Planet ? (int) distanceTo((Planet) o) : 0;
    }

    @Override
    public String toString() {
        return "Planet{" +
                "name=" + name +
                ", color='" + color + '\'' +
                ", fleetSize=" + fleetSize +
                ", planetSize=" + planetSize +

                '}';
    }
}